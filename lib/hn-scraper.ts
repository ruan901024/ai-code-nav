// Hot/Trending Scraper — fetches trending AI items from Hacker News, Product Hunt, and GitHub Trending.
import { toolDb, DbTool } from './db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  type: 'story' | 'job' | 'comment' | 'poll' | 'poll_part';
  descendants?: number; // comment count
}

interface ProductHuntProduct {
  id: number;
  name: string;
  tagline: string;
  description?: string;
  website_url?: string;
  redirect_url?: string;
  votes_count: number;
  comments_count: number;
  screenshots?: Array<{ url: string }>;
}

interface GitHubTrendingRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number | null;
  forks_count: number | null;
  language: string | null;
}

// ---------------------------------------------------------------------------
// Category mapping for hot items
// ---------------------------------------------------------------------------
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'agent': ['Agent', 'agent', 'LangChain', 'langchain', 'AutoGPT', 'CrewAI'],
  'video-gen': ['Video', 'video', 'Stable Video', 'SVD', 'ModelScope', 'T2V'],
  'code-assist': ['Code', 'code', 'Coder', 'codex', 'TabNine', 'Cursor'],
  'image-gen': ['Image', 'image', 'Stable Diffusion', 'SDXL', 'ControlNet', 'LoRA', 'ComfyUI'],
  'llm': ['LLM', 'llm', 'GPT', 'ChatGLM', 'Qwen', 'Baichuan', 'Yi-', 'InternLM', 'DeepSeek'],
  'data-viz': ['Data', 'data', 'Visualization', 'viz', 'Dashboard'],
  'audio-gen': ['Audio', 'audio', 'TTS', 'Speech', 'Whisper', 'MusicGen'],
  'workflow': ['Workflow', 'workflow', 'Pipeline', 'pipeline', 'Automation'],
  'search': ['Search', 'search', 'RAG', 'Retrieval', 'Embedding'],
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return catId;
    }
  }
  return 'other';
}

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Hacker News scraper
// ---------------------------------------------------------------------------
async function fetchHNTopStories(): Promise<HNItem[]> {
  // Fetch top story IDs from the "best" endpoint (last 4 weeks)
  const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/beststories.json');
  if (!idsRes.ok) throw new Error(`HN beststories: ${idsRes.status}`);
  
  const ids = (await idsRes.json()) as number[];
  // Take top 50 IDs and fetch details
  const topIds = ids.slice(0, 50);
  
  const items = await Promise.all(
    topIds.map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (!res.ok) return null;
      return (await res.json()) as HNItem | null;
    })
  );

  // Filter for AI-related stories with URLs and sort by score
  return items
    .filter((item): item is HNItem => 
      item !== null && 
      item.type === 'story' && 
      !!item.url && 
      item.score > 50
    )
    .sort((a, b) => b.score - a.score);
}

async function fetchHNTrending(): Promise<HNItem[]> {
  // Fetch new stories (most recent batch)
  const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json');
  if (!idsRes.ok) throw new Error(`HN newstories: ${idsRes.status}`);
  
  const ids = (await idsRes.json()) as number[];
  // Take top 30 newest IDs and fetch details
  const recentIds = ids.slice(0, 30);
  
  const items = await Promise.all(
    recentIds.map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (!res.ok) return null;
      return (await res.json()) as HNItem | null;
    })
  );

  // Filter for AI-related stories with URLs and sort by score
  return items
    .filter((item): item is HNItem => 
      item !== null && 
      item.type === 'story' && 
      !!item.url && 
      item.score > 10
    )
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Product Hunt scraper
// ---------------------------------------------------------------------------
async function fetchProductHunt(): Promise<ProductHuntProduct[]> {
  const res = await fetch('https://api.producthunt.com/v2/api/products?filter[launch_date]=2026-05-09&sort=votes_count&per_page=30', {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'ai-code-nav-scraper/1.0',
    },
  });

  if (!res.ok) throw new Error(`Product Hunt API error: ${res.status}`);

  const body = await res.json();
  return (body.data || []) as ProductHuntProduct[];
}

// ---------------------------------------------------------------------------
// GitHub Trending scraper
// ---------------------------------------------------------------------------
async function fetchGitHubTrending(): Promise<GitHubTrendingRepo[]> {
  // Use the GitHub Search API with token for higher rate limits (5000 req/hr vs 60)
  const token = process.env.GITHUB_TOKEN || '';
  const res = await fetch('https://api.github.com/search/repositories?q=language:python+created:>2026-01-01&sort=stars&order=desc&per_page=30', {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ai-code-nav-scraper/1.0',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`GitHub Trending API error: ${res.status}`);

  const body = await res.json();
  return (body.items || []) as GitHubTrendingRepo[];
}

// ---------------------------------------------------------------------------
// Map to DbTool format
// ---------------------------------------------------------------------------
function mapHNToDbTool(item: HNItem, source: 'hackernews' | 'producthunt'): Omit<DbTool, 'createdAt' | 'updatedAt'> {
  const category = detectCategory(item.title);
  
  return {
    id: `${source}-${item.id}`,
    name: item.title,
    description: '', // HN doesn't have descriptions
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    category,
    source,
    stars: item.score,
    forks: 0,
    downloads: 0,
    likes: item.descendants || 0,
    language: null,
    tags: [],
    isPremium: false,
  };
}

function mapProductHuntToDbTool(product: ProductHuntProduct): Omit<DbTool, 'createdAt' | 'updatedAt'> {
  const category = detectCategory(`${product.name} ${product.tagline}`);
  
  return {
    id: `ph-${product.id}`,
    name: product.name,
    description: product.description || product.tagline,
    url: product.redirect_url || product.website_url || `https://www.producthunt.com/posts/${product.name.toLowerCase().replace(/\s+/g, '-')}`,
    category,
    source: 'producthunt',
    stars: product.votes_count,
    forks: 0,
    downloads: 0,
    likes: product.comments_count || 0,
    language: null,
    tags: [],
    isPremium: false,
  };
}

function mapGitHubTrendingToDbTool(repo: GitHubTrendingRepo): Omit<DbTool, 'createdAt' | 'updatedAt'> {
  const category = detectCategory(`${repo.name} ${repo.description || ''}`);
  
  return {
    id: `gh-trending-${repo.full_name.replace('/', '-')}`,
    name: repo.name,
    description: repo.description || '',
    url: repo.html_url,
    category,
    source: 'github',
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    downloads: 0,
    likes: 0,
    language: repo.language || null,
    tags: [],
    isPremium: false,
  };
}

// ---------------------------------------------------------------------------
// Core scraper logic
// ---------------------------------------------------------------------------
/** Run all scrapers and upsert into the database. */
export async function scrapeAndStore(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  const seenIds = new Set<string>();

  console.log('[Hot Scraper] Starting…');

  // 1. Hacker News top stories
  try {
    const hnItems = await fetchHNTopStories();
    console.log(`[Hot Scraper] HN Top Stories → ${hnItems.length} results`);

    for (const item of hnItems) {
      if (seenIds.has(item.id.toString())) {
        skipped++;
        continue;
      }
      seenIds.add(item.id.toString());

      const tool = mapHNToDbTool(item, 'hackernews');
      toolDb.upsert(tool);
      inserted++;
    }

    await sleep(1000); // Rate limit friendly
  } catch (err) {
    console.error('[Hot Scraper] HN Top Stories error:', err);
  }

  // 2. Hacker News trending (newest)
  try {
    const hnTrending = await fetchHNTrending();
    console.log(`[Hot Scraper] HN Trending → ${hnTrending.length} results`);

    for (const item of hnTrending) {
      if (seenIds.has(item.id.toString())) {
        skipped++;
        continue;
      }
      seenIds.add(item.id.toString());

      const tool = mapHNToDbTool(item, 'hackernews');
      toolDb.upsert(tool);
      inserted++;
    }

    await sleep(1000); // Rate limit friendly
  } catch (err) {
    console.error('[Hot Scraper] HN Trending error:', err);
  }

  // 3. Product Hunt
  try {
    const phProducts = await fetchProductHunt();
    console.log(`[Hot Scraper] Product Hunt → ${phProducts.length} results`);

    for (const product of phProducts) {
      if (seenIds.has(product.id.toString())) {
        skipped++;
        continue;
      }
      seenIds.add(product.id.toString());

      const tool = mapProductHuntToDbTool(product);
      toolDb.upsert(tool);
      inserted++;
    }

    await sleep(1000); // Rate limit friendly
  } catch (err) {
    console.error('[Hot Scraper] Product Hunt error:', err);
  }

  // 4. GitHub Trending
  try {
    const ghTrending = await fetchGitHubTrending();
    console.log(`[Hot Scraper] GitHub Trending → ${ghTrending.length} results`);

    for (const repo of ghTrending) {
      if (seenIds.has(repo.full_name)) {
        skipped++;
        continue;
      }
      seenIds.add(repo.full_name);

      const tool = mapGitHubTrendingToDbTool(repo);
      toolDb.upsert(tool);
      inserted++;
    }
  } catch (err) {
    console.error('[Hot Scraper] GitHub Trending error:', err);
  }

  console.log(`[Hot Scraper] Done — ${inserted} tools inserted/updated, ${skipped} duplicates skipped.`);
  return { inserted, skipped };
}

/** Convenience: run the scraper and log a summary. */
export async function runScraper(): Promise<void> {
  const result = await scrapeAndStore();
  console.log('[Hot Scraper] Summary:', JSON.stringify(result));
}
