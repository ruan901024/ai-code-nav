// @ts-nocheck — better-sqlite3 types conflict with esModuleInterop
// Data Seeder — runs on startup to seed initial data via the GitHub scraper.
import { toolDb, getDb } from './db';
import { scrapeAndStore } from './github-scraper';

/**
 * Seed the database with initial AI project data.
 *
 * On first run (or when the tools table is empty), this fetches top Chinese
 * AI projects from GitHub and stores them in the local SQLite database.
 */
export async function seedData(): Promise<void> {
  const count = toolDb.count();

  if (count > 0) {
    console.log(`[Data Seeder] Database already has ${count} tools — skipping initial seed.`);
    return;
  }

  console.log('[Data Seeder] Empty database detected — running GitHub scraper to seed data…');

  try {
    const result = await scrapeAndStore();
    const finalCount = toolDb.count();
    console.log(`[Data Seeder] Seed complete — ${finalCount} tools in the database.`);
  } catch (err) {
    console.error('[Data Seeder] Error during seed:', err);
  }
}

/**
 * Force re-seed: clears existing data and runs the scraper again.
 * Useful for development or full refreshes.
 */
export async function forceReseed(): Promise<void> {
  const db = getDb();
  db.prepare('DELETE FROM tools').run();
  console.log('[Data Seeder] Cleared existing tools — re-running scraper…');
  await scrapeAndStore();
}

// Auto-run when this module is imported (e.g. via a Next.js route handler or script)
if (process.env.SEED_ON_IMPORT === 'true') {
  seedData().catch(console.error);
}
