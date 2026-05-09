import { NextResponse } from 'next/server';
import { scrapeAndStore } from '@/lib/hn-scraper';

/**
 * Cron job endpoint for periodic hot/trending data scraping
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

    // Run the scraper
    const result = await scrapeAndStore();

    return NextResponse.json({
      success: true,
      message: `Scraped and stored ${result.inserted} hot items (${result.skipped} duplicates skipped)`,
      data: {
        inserted: result.inserted,
        skipped: result.skipped,
      },
    });
  } catch (error) {
    console.error('Cron scrape-hot error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
