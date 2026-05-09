// GitHub API Scraper — fetches top Chinese AI projects and stores them in the database.
import { toolDb, DbTool } from './db';

// ---------------------------------------------------------------------------
// Category mapping: keyword → category id
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

// ---------------------------------------------------------------------------
// Search queries — tuned for Chinese AI ecosystem projects
// ---------------------------------------------------------------------------
const SEARCH_QUERIES: { query: string; categoryHint?: string }[] = [
  { query: 'stars:>500 language:python "AI" lang:zh OR org:"BAAI"' },
  { query: 'stars:>300 language:python LLM' },
  { query: 'stars:>200 language:python Agent' },
  { query: 'stars:>200 language:python "Stable Diffusion" OR ComfyUI' },
  { query: 'stars:>100 language:python LangChain' },
  { query: 'stars:>300 language:python ChatGLM OR Qwen OR Baichuan OR Yi- OR InternLM OR DeepSeek' },
  { query: 'stars:>200 language:python "Video Generation" OR T2V OR SVD' },
  { query: 'stars:>200 language:python "Image Generation" OR SDXL OR ControlNet OR LoRA' },
  { query: 'stars:>100 language:javascript AI' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sleep for a given number of milliseconds (rate-limit friendly). */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Determine the best category for a repo based on its name/description/tags. */
function detectCategory(repo: GitHubRepo): string {
  const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();

  // Check each category's keywords (order matters — more specific first)
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return catId;
    }
  }

  // Fallback: try to match by topic
  const topics = repo.topics || [];
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (topics.some((t) => keywords.map((k) => k.toLowerCase()).includes(t))) {
      return catId;
    }
  }

  return 'other';
}

/** Map a GitHub search result to the DbTool interface. */
function mapToDbTool(repo: GitHubRepo): Omit<DbTool, 'createdAt' | 'updatedAt'> {
  const category = detectCategory(repo);
  const tags = (repo.topics || []).filter((t) => t.length > 0).slice(0, 20);

  return {
    id: `gh-${repo.id}`,
    name: repo.name,
    description: repo.description || '',
    url: repo.html_url,
    category,
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    language: repo.language || null,
    tags,
    isPremium: false,
  };
}

// ---------------------------------------------------------------------------
// GitHub API types (minimal — only what we need)
// ---------------------------------------------------------------------------
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number | null;
  forks_count: number | null;
  language: string | null;
  topics: string[];
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

// ---------------------------------------------------------------------------
// Core scraper logic
// ---------------------------------------------------------------------------

/** Fetch a single page of results from the GitHub Search API. */
async function fetchGitHubPage(query: string, perPage = 30): Promise<GitHubRepo[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${perPage}&sort=stars&order=desc`;
  const token = process.env.GITHUB_TOKEN || '';

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ai-code-nav-scraper/1.0',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    // Rate-limited — wait and retry once
    if (res.status === 403 || res.status === 429) {
      const retryAfter = Number(res.headers.get('Retry-After') ?? 60);
      console.log(`[GitHub Scraper] Rate limited for query "${query}", waiting ${retryAfter}s…`);
      await sleep(retryAfter * 1000);
      const retryRes = await fetch(url, { headers });
      if (!retryRes.ok) throw new Error(`GitHub API error: ${res.status} for "${query}"`);
    } else {
      throw new Error(`GitHub API error: ${res.status} for "${query}"`);
    }
  }

  const body = (await res.json()) as GitHubSearchResponse;
  return body.items || [];
}

/** Run all search queries, map results to DbTool format, and upsert into the database. */
export async function scrapeAndStore(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  const seenUrls = new Set<string>();

  console.log(`[GitHub Scraper] Starting with ${SEARCH_QUERIES.length} queries…`);

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const { query, categoryHint } = SEARCH_QUERIES[i];

    try {
      const repos = await fetchGitHubPage(query);
      console.log(`[GitHub Scraper] Query ${i + 1}/${SEARCH_QUERIES.length} "${query}" → ${repos.length} results`);

      for (const repo of repos) {
        // Deduplicate by URL
        if (seenUrls.has(repo.html_url)) {
          skipped++;
          continue;
        }
        seenUrls.add(repo.html_url);

        const tool = mapToDbTool(repo);

        // If a category hint was provided and detection returned 'other', use the hint instead
        if (categoryHint && tool.category === 'other') {
          tool.category = categoryHint;
        }

        toolDb.upsert(tool);
        inserted++;
      }

      // Rate-limit friendly: short delay between queries
      await sleep(2000);
    } catch (err) {
      console.error(`[GitHub Scraper] Error on query "${query}":`, err);
    }
  }

  console.log(`[GitHub Scraper] Done — ${inserted} tools inserted/updated, ${skipped} duplicates skipped.`);
  return { inserted, skipped };
}

/** Convenience: run the scraper and log a summary. */
export async function runScraper(): Promise<void> {
  const result = await scrapeAndStore();
  console.log('[GitHub Scraper] Summary:', JSON.stringify(result));
}
