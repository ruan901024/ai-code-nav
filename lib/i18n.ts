// Translation strings for the AI Code Navigation site
export type Locale = 'zh' | 'en';

export const translations: Record<Locale, Record<string, string | ((...args: unknown[]) => string)>> = {
  zh: {
    // Site metadata
    siteTitle: 'AI 代码导航站',
    siteDescription: '精选优质 AI 开源项目，涵盖 Agent、视频生成、代码辅助、图像生成、大语言模型等热门领域。',
    
    // Navigation
    home: '首页',
    categories: '分类',
    search: '搜索',
    premium: 'Premium',
    
    // Hero section
    heroTitle: 'AI 代码导航站',
    heroSubtitle: '精选优质 AI 开源项目，涵盖 Agent、视频生成、代码辅助、图像生成、大语言模型等热门领域。',
    
    // Search
    searchPlaceholder: '搜索 AI 工具...',
    searchResultsFor: (...args: unknown[]) => `搜索 "${String(args[0])}" 的结果`,
    noResultsFound: '未找到结果',
    noResultsMessage: (...args: unknown[]) => `没有找到与 "${String(args[0])}" 匹配的 AI 工具。`,
    enterKeyword: '输入关键词开始搜索',
    enterKeywordMessage: '在上方搜索框中输入 AI 工具名称或描述。',
    resultsFound: (...args: unknown[]) => `找到 ${Number(args[0])} 个结果`,
    
    // Sections
    hotTools: '🔥 热门工具',
    toolCategories: '📂 工具分类',
    
    // Category count
    toolsCount: (...args: unknown[]) => `${Number(args[0])} 个工具`,
    
    // Footer
    footerCopyright: '© 2026 AI 代码导航站. All rights reserved.',
    
    // Language switcher
    languageZh: '中文',
    languageEn: 'English',
  },
  en: {
    // Site metadata
    siteTitle: 'AI Code Navigator',
    siteDescription: 'Curated high-quality AI open-source projects covering Agents, video generation, code assistance, image generation, large language models, and more.',
    
    // Navigation
    home: 'Home',
    categories: 'Categories',
    search: 'Search',
    premium: 'Premium',
    
    // Hero section
    heroTitle: 'AI Code Navigator',
    heroSubtitle: 'Curated high-quality AI open-source projects covering Agents, video generation, code assistance, image generation, large language models, and more.',
    
    // Search
    searchPlaceholder: 'Search AI tools...',
    searchResultsFor: (...args: unknown[]) => `Results for "${String(args[0])}"`,
    noResultsFound: 'No results found',
    noResultsMessage: (...args: unknown[]) => `No AI tools matching "${String(args[0])}".`,
    enterKeyword: 'Enter a keyword to search',
    enterKeywordMessage: 'Type an AI tool name or description in the search box above.',
    resultsFound: (...args: unknown[]) => `${Number(args[0])} results found`,
    
    // Sections
    hotTools: '🔥 Hot Tools',
    toolCategories: '📂 Categories',
    
    // Category count
    toolsCount: (...args: unknown[]) => `${Number(args[0])} tools`,
    
    // Footer
    footerCopyright: '© 2026 AI Code Navigator. All rights reserved.',
    
    // Language switcher
    languageZh: '中文',
    languageEn: 'English',
  },
};

// Category translations
export const categoryTranslations = {
  zh: {
    agent: { name: 'AI Agent', description: '智能体框架与平台' },
    'video-gen': { name: '视频生成', description: '视频生成工具' },
    'code-assist': { name: '代码辅助', description: '代码辅助工具' },
    'image-gen': { name: '图像生成', description: '图像生成工具' },
    llm: { name: '大语言模型', description: '大语言模型' },
    'data-viz': { name: '数据可视化', description: '数据可视化工具' },
    'audio-gen': { name: '音频生成', description: '音频生成工具' },
    workflow: { name: '工作流自动化', description: '工作流自动化' },
    search: { name: 'AI 搜索', description: '智能搜索引擎' },
    other: { name: '其他 AI 工具', description: '其他AI工具' },
  },
  en: {
    agent: { name: 'AI Agent', description: 'Agent frameworks and platforms' },
    'video-gen': { name: 'Video Generator', description: 'Video generation tools' },
    'code-assist': { name: 'Code Assistant', description: 'Code assistance tools' },
    'image-gen': { name: 'Image Generator', description: 'Image generation tools' },
    llm: { name: 'Large Language Model', description: 'Large language models' },
    'data-viz': { name: 'Data Visualization', description: 'Data visualization tools' },
    'audio-gen': { name: 'Audio Generator', description: 'Audio generation tools' },
    workflow: { name: 'Workflow Automation', description: 'Workflow automation' },
    search: { name: 'AI Search', description: 'Intelligent search engines' },
    other: { name: 'Other AI Tools', description: 'Other AI tools' },
  },
};
