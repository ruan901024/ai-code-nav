import { NextResponse } from 'next/server';
import { scrapeAndStore as githubScrape } from '@/lib/github-scraper';
import { scrapeAndStore as hotScrape } from '@/lib/hn-scraper';
import { seedCuratedWebsites } from '@/lib/seed-data';

/**
 * Cron job endpoint for periodic data scraping and seeding
 * Called by Vercel cron daily at midnight UTC
 */
export async function GET(request: Request) {
  try {
    // Verify Vercel cron token (optional security)
    const authHeader = request.headers.get('authorization');
    const cronToken = process.env.CRON_TOKEN;

    if (cronToken && authHeader !== `Bearer ${cronToken}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Seed curated websites (idempotent)
    const seedResult = seedCuratedWebsites();

    // 2. Run GitHub scraper
    const githubResult = await githubScrape();

    // 3. Run hot/trending scraper (HN, Product Hunt, GitHub Trending)
    const hotResult = await hotScrape();

    return NextResponse.json({
      success: true,
      message: `Data updated successfully`,
      data: {
        curated: seedResult,
        github: { inserted: githubResult.inserted, skipped: githubResult.skipped },
        hot: { inserted: hotResult.inserted, skipped: hotResult.skipped },
      },
    });
  } catch (error) {
    console.error('Cron scrape error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
