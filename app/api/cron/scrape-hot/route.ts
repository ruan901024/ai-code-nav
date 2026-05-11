import { NextResponse } from 'next/server';
import { scrapeAndStore } from '@/lib/hn-scraper';
import { postDb } from '@/lib/db';

/**
 * Generate a concise Chinese summary using LLM API.
 */
async function generateSummary(title: string, context: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || '';
  const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

  if (!apiKey) {
    return `关于「${title}」的摘要（待生成）`;
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'minimax-m2.5-free',
        messages: [
          {
            role: 'system',
            content: '你是一个科技资讯编辑。请用中文写一段简洁的摘要（100字以内），介绍这个项目的核心功能、技术亮点和应用场景。语气专业但易懂。',
          },
          {
            role: 'user',
            content: `标题：${title}\n内容片段：${context.slice(0, 3000)}`,
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!res.ok) throw new Error(`LLM API error: ${res.status}`);

    const body = await res.json();
    return body.choices?.[0]?.message?.content?.trim() || `关于「${title}」的摘要（待生成）`;
  } catch (err) {
    console.warn('[Generate Summary] LLM API failed:', err);
    // Fallback summary from title
    return `${title} — AI 生成的摘要将在下次 cron 运行时更新。`;
  }
}

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

    // Auto-generate content summaries for newly inserted posts
    let generated = 0;
    try {
      const allPosts = postDb.getAll(50, 0);
      const newWithoutContent = allPosts.filter(p => !p.content || p.content === '');
      
      for (const post of newWithoutContent.slice(0, 20)) { // Limit to 20 per run
        try {
          const summary = await generateSummary(post.title, '');
          
          postDb.upsert({
            id: post.id,
            title: post.title,
            url: post.url,
            source: post.source,
            score: post.score,
            comments: post.comments,
            content: summary,
          });
          generated++;
        } catch (err) {
          console.error(`[Auto Generate] Error for ${post.id}:`, err);
        }
      }
    } catch (err) {
      console.warn('[Auto Generate] Batch error:', err);
    }

    return NextResponse.json({
      success: true,
      message: `Scraped and stored ${result.inserted} hot items (${result.skipped} duplicates skipped), generated ${generated} summaries`,
      data: {
        inserted: result.inserted,
        skipped: result.skipped,
        generated,
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
