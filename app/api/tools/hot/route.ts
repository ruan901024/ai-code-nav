import { NextResponse } from 'next/server';
import { toolDb } from '@/lib/db';

/**
 * API endpoint to fetch trending/hot tools
 * Supports optional source filtering and limit parameter
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch tools sorted by stars (score) descending
    const allTools = toolDb.getAll(limit, offset);

    return NextResponse.json({
      success: true,
      data: allTools,
      total: allTools.length,
    });
  } catch (error) {
    console.error('Hot tools API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
