// Hot/Trending Scraper — fetches trending AI items from Hacker News, Product Hunt, and GitHub Trending.
import { postDb, DbPost, toolDb, DbTool } from './db';

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
  // Try v2 API first, fallback to web scraping if needed
  try {
    const res = await fetch('https://api.producthunt.com/v2/api/products?filter[launch_date]=today&sort=votes_count&per_page=30', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ai-code-nav-scraper/1.0',
      },
    });

    if (!res.ok) throw new Error(`Product Hunt API error: ${res.status}`);

    const body = await res.json();
    return (body.data || []) as ProductHuntProduct[];
  } catch (err) {
    console.warn('[Hot Scraper] PH v2 API failed, trying alternative:', err);
    
    // Fallback: try the top products endpoint without date filter
    try {
      const res = await fetch('https://api.producthunt.com/v2/api/products?sort=votes_count&per_page=30', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ai-code-nav-scraper/1.0',
        },
      });

      if (!res.ok) throw new Error(`Product Hunt API error: ${res.status}`);

      const body = await res.json();
      return (body.data || []) as ProductHuntProduct[];
    } catch (err2) {
      console.warn('[Hot Scraper] PH fallback also failed:', err2);
      return [];
    }
  }
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
// Map to DbPost format
// ---------------------------------------------------------------------------
function mapHNToDbPost(item: HNItem): Omit<DbPost, 'publishedAt' | 'fetchedAt'> {
  return {
    id: `hn-${item.id}`,
    title: item.title,
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    source: 'hackernews',
    score: item.score,
    comments: item.descendants ?? 0,
    content: '', // Will be filled by AI summarizer
  };
}

function mapProductHuntToDbPost(product: ProductHuntProduct): Omit<DbPost, 'publishedAt' | 'fetchedAt'> {
  return {
    id: `ph-${product.id}`,
    title: product.name,
    url: product.redirect_url || product.website_url || `https://www.producthunt.com/posts/${product.name.toLowerCase().replace(/\s+/g, '-')}`,
    source: 'producthunt',
    score: product.votes_count,
    comments: product.comments_count ?? 0,
    content: '', // Will be filled by AI summarizer
  };
}

function mapGitHubTrendingToDbTool(repo: GitHubTrendingRepo): Omit<DbTool, 'createdAt' | 'updatedAt'> {
  return {
    id: `gh-trending-${repo.full_name.replace('/', '-')}`,
    name: repo.name,
    description: repo.description || '',
    url: repo.html_url,
    category: detectCategory(`${repo.name} ${repo.description || ''}`),
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
// Category mapping for tools (GitHub repos only)
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
// Core scraper logic
// ---------------------------------------------------------------------------
/** Run all scrapers and upsert into the database. */
export async function scrapeAndStore(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  const seenIds = new Set<string>();

  console.log('[Hot Scraper] Starting…');

  // 1. Hacker News top stories → posts table
  try {
    const hnItems = await fetchHNTopStories();
    console.log(`[Hot Scraper] HN Top Stories → ${hnItems.length} results`);

    for (const item of hnItems) {
      if (seenIds.has(item.id.toString())) {
        skipped++;
        continue;
      }
      seenIds.add(item.id.toString());

      const post = mapHNToDbPost(item);
      postDb.upsert(post);
      inserted++;
    }

    await sleep(1000); // Rate limit friendly
  } catch (err) {
    console.error('[Hot Scraper] HN Top Stories error:', err);
  }

  // 2. Hacker News trending (newest) → posts table
  try {
    const hnTrending = await fetchHNTrending();
    console.log(`[Hot Scraper] HN Trending → ${hnTrending.length} results`);

    for (const item of hnTrending) {
      if (seenIds.has(item.id.toString())) {
        skipped++;
        continue;
      }
      seenIds.add(item.id.toString());

      const post = mapHNToDbPost(item);
      postDb.upsert(post);
      inserted++;
    }

    await sleep(1000); // Rate limit friendly
  } catch (err) {
    console.error('[Hot Scraper] HN Trending error:', err);
  }

  // 3. Product Hunt → posts table
  try {
    const phProducts = await fetchProductHunt();
    console.log(`[Hot Scraper] Product Hunt → ${phProducts.length} results`);

    for (const product of phProducts) {
      if (seenIds.has(product.id.toString())) {
        skipped++;
        continue;
      }
      seenIds.add(product.id.toString());

      const post = mapProductHuntToDbPost(product);
      postDb.upsert(post);
      inserted++;
    }

    await sleep(1000); // Rate limit friendly
  } catch (err) {
    console.error('[Hot Scraper] Product Hunt error:', err);
  }

  // 4. GitHub Trending → tools table (repos are tools, not posts)
  try {
    const ghTrending = await fetchGitHubTrending();
    console.log(`[Hot Scraper] GitHub Trending → ${ghTrending.length} results`);

    for (const repo of ghTrending) {
      if (seenIds.has(repo.full_name)) {
        skipped++;
        continue;
      }
      seenIds.add(repo.full_name);

      // Keep GitHub repos as tools — they're actual code repositories
      const tool = mapGitHubTrendingToDbTool(repo);
      toolDb.upsert(tool);
      inserted++;
    }
  } catch (err) {
    console.error('[Hot Scraper] GitHub Trending error:', err);
  }

  console.log(`[Hot Scraper] Done — ${inserted} items inserted/updated, ${skipped} duplicates skipped.`);
  return { inserted, skipped };
}

/** Convenience: run the scraper and log a summary. */
export async function runScraper(): Promise<void> {
  const result = await scrapeAndStore();
  console.log('[Hot Scraper] Summary:', JSON.stringify(result));
}

// Auto-run when executed directly via `npx tsx lib/hn-scraper.ts`
if (require.main === module) {
  runScraper();
}
