import { NextResponse } from 'next/server';
import { postDb } from '@/lib/db';

/**
 * API endpoint to generate AI summaries for posts.
 * This endpoint fetches the post content from external sources and uses an LLM
 * to create a concise summary in Chinese.
 */
export async function POST(request: Request) {
  try {
    const { postId, source } = await request.json();

    // Get the post from database
    const allPosts = postDb.getAll(100, 0);
    const post = allPosts.find(p => p.id === postId);

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    // Fetch the external page content (simplified for now)
    let summary = '';
    
    try {
      // For HN posts, fetch the article page and extract text
      if (source === 'hackernews') {
        const res = await fetch(post.url, {
          headers: {
            'User-Agent': 'ai-code-nav-scraper/1.0',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        
        if (res.ok) {
          const html = await res.text();
          // Simple HTML to text extraction
          const text = html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p[^>]*>/gi, '\n')
            .replace(/<\/p>/gi, '')
            .replace(/<div[^>]*>/gi, '\n')
            .replace(/<\/div>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\&nbsp;/g, ' ')
            .trim();
          
          // Take first 2000 chars as context for summarization
          const context = text.slice(0, 2000);
          
          // Call LLM API to generate summary
          summary = await generateSummary(post.title, context);
        }
      } else if (source === 'producthunt') {
        // For PH posts, use the product description as context
        const res = await fetch(`https://api.producthunt.com/v2/api/posts/${postId}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ai-code-nav-scraper/1.0',
          },
        });
        
        if (res.ok) {
          const body = await res.json();
          const description = body.data?.attributes?.tagline || '';
          summary = await generateSummary(post.title, description);
        }
      }
    } catch (err) {
      console.error('[Generate Content] Error fetching content:', err);
      // Fallback: generate summary from title alone
      summary = await generateSummary(post.title, '');
    }

    // Update the post with generated content
    postDb.upsert({
      id: post.id,
      title: post.title,
      url: post.url,
      source: post.source,
      score: post.score,
      comments: post.comments,
      content: summary,
    });

    return NextResponse.json({
      success: true,
      message: 'Content generated successfully',
      data: { content: summary },
    });
  } catch (error) {
    console.error('[Generate Content] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

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
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
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
 * GET endpoint to trigger batch content generation for all posts without content.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronToken = process.env.CRON_TOKEN;

    if (cronToken && authHeader !== `Bearer ${cronToken}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all posts without content
    const allPosts = postDb.getAll(100, 0);
    const postsWithoutContent = allPosts.filter(p => !p.content || p.content === '');

    let generated = 0;
    for (const post of postsWithoutContent.slice(0, 20)) { // Limit to 20 per run
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
        console.error(`[Batch Generate] Error for ${post.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated summaries for ${generated} posts`,
      data: { generated },
    });
  } catch (error) {
    console.error('[Batch Generate] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
