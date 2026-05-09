import { NextResponse } from 'next/server';
import { scrapeAndStore as hfScrapeAndStore } from '@/lib/hf-scraper';

/**
 * Cron job endpoint for periodic HuggingFace data scraping
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

    // Run the HF scraper
    const result = await hfScrapeAndStore();

    return NextResponse.json({
      success: true,
      message: `HuggingFace scraped and stored ${result.inserted} tools (${result.skipped} duplicates skipped)`,
      data: {
        inserted: result.inserted,
        skipped: result.skipped,
      },
    });
  } catch (error) {
    console.error('Cron HF scrape error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
