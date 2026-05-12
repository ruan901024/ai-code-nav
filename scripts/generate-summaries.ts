import { postDb } from '../lib/db';

// Generate summary function (copied from route.ts)
async function generateSummary(title: string, context: string): Promise<string> {
  const apiKey = 'sk-1Gl68J9xj72m6VCIPgAFY0FVi2KWzTkBYR1JDFDaZWmOwZg5FqDQuwPLUNVGEe5Z';
  const apiUrl = 'http://127.0.0.1:1234/v1/chat/completions';

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen3.6-27b-uncensored',
        messages: [
          {
            role: 'system',
            content: '你是一个科技资讯编辑。请用中文写一段简洁的摘要（100字以内），介绍这个项目的核心功能、技术亮点和应用场景。语气专业但易懂。直接输出摘要，不需要思考过程。',
          },
          {
            role: 'user',
            content: `标题：${title}\n内容片段：${context.slice(0, 3000)}`,
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!res.ok) throw new Error(`LLM API error: ${res.status}`);

    const body = await res.json();
    const message = body.choices?.[0]?.message;
    
    // Use content if available, otherwise extract from reasoning_content
    if (message?.content?.trim()) {
      return message.content.trim();
    }
    
    // Extract summary from reasoning_content (model outputs thinking process first)
    const rc = message?.reasoning_content || '';
    
    // Find the actual Chinese summary by looking for lines with substantial Chinese text
    const lines = rc.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip thinking process markers and short lines
      if (trimmed.length > 30 && 
          !trimmed.startsWith('**') && 
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('1.') &&
          !trimmed.startsWith('2.') &&
          !trimmed.startsWith('3.') &&
          !trimmed.startsWith('4.') &&
          !trimmed.startsWith('5.') &&
          !trimmed.includes('Analyze') &&
          !trimmed.includes('Deconstruct') &&
          !trimmed.includes('Identify')) {
        // Check if it has substantial Chinese characters
        const chineseChars = trimmed.match(/[\u4e00-\u9fff]/g);
        if (chineseChars && chineseChars.length > 15) {
          // Remove trailing character count markers like "(48)" or "（~98 characters）"
          let result = trimmed.slice(0, 200);
          result = result.replace(/\([0-9]+.*?\)$/, '');
          result = result.replace(/（[0-9]+.*?）$/, '');
          return result.trim();
        }
      }
    }
    
    // Fallback: use the last paragraph of reasoning_content
    const paragraphs = rc.split('\n\n').filter((p: string) => p.trim());
    for (const p of paragraphs.reverse()) {
      if (p.length > 20 && !p.startsWith('Here') && !p.includes('**')) {
        return p.slice(0, 200);
      }
    }
    
    return `关于「${title}」的摘要（待生成）`;
  } catch (err) {
    console.warn('[Generate Summary] LLM API failed:', err);
    return `${title} — AI 生成的摘要将在下次 cron 运行时更新。`;
  }
}

(async () => {
  // Get all posts without content or with placeholder/thinking content
  const allPosts = postDb.getAll(100, 0);
  const postsWithoutContent = allPosts.filter(p => 
    !p.content || 
    p.content === '' || 
    p.content.includes('AI 生成的摘要将在下次 cron') ||
    p.content.startsWith("Here's a thinking process") ||
    p.content.includes('的摘要（待生成）')
  );

  console.log(`Found ${postsWithoutContent.length} posts without content`);

  let generated = 0;
  for (const post of postsWithoutContent.slice(0, 50)) { // Limit to 50 per run
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
      console.log(`Generated for: ${post.title.slice(0, 50)}`);
      
      // Rate limit friendly
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err) {
      console.error(`Error for ${post.id}:`, err);
    }
  }

  console.log(`Generated summaries for ${generated} posts`);
})();
