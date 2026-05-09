// HuggingFace API Scraper — fetches popular Models, Datasets, and Spaces from HuggingFace.
import { toolDb, DbTool } from './db';

// ---------------------------------------------------------------------------
// Category mapping: HF tag → category id
// ---------------------------------------------------------------------------
const TAG_CATEGORY_MAP: Record<string, string> = {
  // Model types
  'text-generation': 'llm',
  'translation': 'llm',
  'summarization': 'llm',
  'question-answering': 'search',
  'text-to-image': 'image-gen',
  'image-to-text': 'data-viz',
  'image-classification': 'data-viz',
  'object-detection': 'data-viz',
  'automatic-speech-recognition': 'audio-gen',
  'speech-to-text': 'audio-gen',
  'text-to-speech': 'audio-gen',
  'text-to-music': 'audio-gen',
  'text-to-video': 'video-gen',
  'image-to-video': 'video-gen',
  'video-classification': 'video-gen',
  'reinforcement-learning': 'agent',
  'robotics': 'agent',
  'code-generation': 'code-assist',
  'code-translation': 'code-assist',
  'fill-mask': 'llm',
  'multiple-choice': 'llm',

  // Library/framework tags
  'transformers': 'llm',
  'diffusers': 'image-gen',
  'peft': 'llm',
  'trl': 'llm',
  'axolotl': 'llm',
  'langchain': 'agent',
  'llamaindex': 'search',

  // Dataset tags
  'conversational': 'llm',
  'code': 'code-assist',
};

// ---------------------------------------------------------------------------
// HF API types (minimal)
// ---------------------------------------------------------------------------
interface HFModel {
  id: string;
  author: string;
  likes: number;
  downloads: number;
  tags: string[];
  pipeline_tag?: string;
  library_name?: string;
  lastModified: string;
}

interface HFItem {
  id: string;
  description: string | null;
  author: string;
  likes: number;
  downloads?: number;
  tags: string[];
  pipeline_tag?: string;
  library_name?: string;
  lastModified: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sleep for a given number of milliseconds (rate-limit friendly). */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Determine category from HF tags/pipeline_tag. */
function detectCategory(item: HFItem): string {
  // Priority: pipeline_tag > library_name > tags
  const pipeline = item.pipeline_tag?.toLowerCase();
  if (pipeline && TAG_CATEGORY_MAP[pipeline]) {
    return TAG_CATEGORY_MAP[pipeline];
  }

  const lib = item.library_name?.toLowerCase();
  if (lib && TAG_CATEGORY_MAP[lib]) {
    return TAG_CATEGORY_MAP[lib];
  }

  for (const tag of item.tags) {
    const lower = tag.toLowerCase();
    if (TAG_CATEGORY_MAP[lower]) {
      return TAG_CATEGORY_MAP[lower];
    }
  }

  // Fallback: check name/description keywords
  const text = `${item.id} ${item.description || ''}`.toLowerCase();
  const fallbacks: Record<string, string[]> = {
    'llm': ['gpt', 'llama', 'qwen', 'mistral', 'bert', 't5', 'bloom', 'chat'],
    'image-gen': ['diffusion', 'stable-diffusion', 'sd-', 'sdxl', 'controlnet', 'lora'],
    'video-gen': ['video', 'svd', 'modelscope', 't2v'],
    'audio-gen': ['whisper', 'speech', 'tts', 'music', 'audio'],
    'agent': ['agent', 'langchain', 'autogpt', 'crewai'],
    'code-assist': ['code', 'codex', 'cursor', 'tabnine'],
  };

  for (const [cat, keywords] of Object.entries(fallbacks)) {
    if (keywords.some(kw => text.includes(kw))) {
      return cat;
    }
  }

  return 'other';
}

/** Map HF item to DbTool format. */
function mapToDbTool(item: HFItem, sourceType: 'models' | 'datasets' | 'spaces'): Omit<DbTool, 'createdAt' | 'updatedAt'> {
  const category = detectCategory(item);
  const tags = item.tags.filter(t => t.length > 0).slice(0, 20);

  // Clean up the id (remove slashes for display)
  const name = item.id.split('/').pop() || item.id;
  const author = item.author;

  return {
    id: `hf-${sourceType}-${item.id.replace('/', '-')}`,
    name,
    description: item.description || `${sourceType} by ${author}`,
    url: `https://huggingface.co/${item.id}`,
    category,
    source: 'huggingface',
    stars: item.likes,
    forks: 0,
    downloads: item.downloads ?? 0,
    likes: item.likes,
    language: null,
    tags,
    isPremium: false,
  };
}

// ---------------------------------------------------------------------------
// Core scraper logic
// ---------------------------------------------------------------------------

/** Fetch popular items from HuggingFace API. */
async function fetchHFItems(
  endpoint: 'models' | 'datasets' | 'spaces',
  limit = 100
): Promise<HFItem[]> {
  // Use mirror in dev/local, official API in production (Vercel)
  const baseUrl = process.env.HF_API_BASE || 'https://huggingface.co';
  const url = `${baseUrl}/api/${endpoint}?limit=${limit}&sort=likes&direction=-1`;

  console.log(`[HF Scraper] Fetching ${endpoint} from ${baseUrl} (top ${limit})…`);

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'ai-code-nav-scraper/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`HF API error: ${res.status} for ${endpoint}`);
  }

  const items = (await res.json()) as HFItem[];
  console.log(`[HF Scraper] Got ${items.length} ${endpoint}`);
  return items;
}

/** Run all HF scrapers and upsert into the database. */
export async function scrapeAndStore(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  const seenUrls = new Set<string>();

  // Fetch Models, Datasets, Spaces — each sorted by likes (popularity)
  const endpoints: Array<'models' | 'datasets' | 'spaces'> = ['models', 'datasets', 'spaces'];

  for (const endpoint of endpoints) {
    try {
      const items = await fetchHFItems(endpoint);

      for (const item of items) {
        const url = `https://huggingface.co/${item.id}`;

        // Deduplicate by URL
        if (seenUrls.has(url)) {
          skipped++;
          continue;
        }
        seenUrls.add(url);

        const tool = mapToDbTool(item, endpoint);
        toolDb.upsert(tool);
        inserted++;
      }

      // Rate-limit friendly: short delay between endpoints
      await sleep(1000);
    } catch (err) {
      console.error(`[HF Scraper] Error on ${endpoint}:`, err);
    }
  }

  console.log(`[HF Scraper] Done — ${inserted} tools inserted/updated, ${skipped} duplicates skipped.`);
  return { inserted, skipped };
}

/** Convenience: run the scraper and log a summary. */
export async function runScraper(): Promise<void> {
  const result = await scrapeAndStore();
  console.log('[HF Scraper] Summary:', JSON.stringify(result));
}
