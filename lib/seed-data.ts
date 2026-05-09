// Curated Recommended Websites — hand-picked, high-quality AI resources
import { toolDb } from './db';

// ---------------------------------------------------------------------------
// Seed data: curated websites to populate the database
// ---------------------------------------------------------------------------
const CURATED_WEBSITES = [
  // === LLM / Foundation Models ===
  {
    id: 'curated-huggingface',
    name: 'Hugging Face',
    description: 'The AI community building the future. Hosts models, datasets, and Spaces for collaborative development.',
    url: 'https://huggingface.co/',
    category: 'llm',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 100,
    language: null, tags: ['LLM', 'Models', 'Datasets'], isPremium: true,
  },
  {
    id: 'curated-langchain-docs',
    name: 'LangChain Documentation',
    description: 'Build AI-powered applications with LangChain. Framework for developing apps backed by LLMs.',
    url: 'https://docs.langchain.com/',
    category: 'agent',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 80,
    language: null, tags: ['LangChain', 'RAG', 'Agent'], isPremium: true,
  },
  {
    id: 'curated-llama-index',
    name: 'LlamaIndex (LLM Framework)',
    description: 'Connect custom data sources to LLMs. Structured and unstructured data ingestion framework.',
    url: 'https://docs.llamaindex.ai/',
    category: 'search',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 75,
    language: null, tags: ['RAG', 'Embedding', 'Retrieval'], isPremium: true,
  },
  {
    id: 'curated-openrouter',
    name: 'OpenRouter API',
    description: 'Unified API for accessing 100+ LLMs. Compare and switch models with a single endpoint.',
    url: 'https://openrouter.ai/',
    category: 'llm',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 92,
    language: null, tags: ['API', 'LLM', 'Inference'], isPremium: true,
  },
  {
    id: 'curated-ollama',
    name: 'Ollama',
    description: 'Run LLMs locally with a single command. Supports Llama, Mistral, Gemma and more.',
    url: 'https://ollama.com/',
    category: 'llm',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 95,
    language: null, tags: ['Local LLM', 'Inference', 'CLI'], isPremium: true,
  },
  {
    id: 'curated-lm-studio',
    name: 'LM Studio',
    description: 'Desktop app for running LLMs locally. GUI interface with model marketplace and chat.',
    url: 'https://lmstudio.ai/',
    category: 'llm',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 85,
    language: null, tags: ['Local LLM', 'GUI', 'Desktop'], isPremium: true,
  },

  // === Code Assist ===
  {
    id: 'curated-cursor',
    name: 'Cursor IDE',
    description: 'The AI-first code editor. Next-generation IDE built for AI-powered development.',
    url: 'https://cursor.com/',
    category: 'code-assist',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 95,
    language: null, tags: ['IDE', 'Code Completion', 'AI Editor'], isPremium: true,
  },
  {
    id: 'curated-replicate',
    name: 'Replicate',
    description: 'Run ML models in the cloud. Serverless inference for popular open-source models.',
    url: 'https://replicate.com/',
    category: 'llm',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 70,
    language: null, tags: ['Inference', 'Cloud', 'API'], isPremium: true,
  },
  {
    id: 'curated-windsurf',
    name: 'Windsurf IDE (Codeium)',
    description: 'AI-native IDE with deep codebase context. Intelligent autocomplete and chat.',
    url: 'https://windsurf.codeium.com/',
    category: 'code-assist',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 78,
    language: null, tags: ['IDE', 'Code Completion', 'AI Editor'], isPremium: true,
  },

  // === Image Generation ===
  {
    id: 'curated-comfyui-docs',
    name: 'ComfyUI Documentation',
    description: 'Node-based GUI for Stable Diffusion. Powerful workflow builder for image generation.',
    url: 'https://github.com/comfyanonymous/ComfyUI',
    category: 'image-gen',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 85,
    language: null, tags: ['Stable Diffusion', 'Workflow', 'GUI'], isPremium: true,
  },
  {
    id: 'curated-clipdrop',
    name: 'Clipdrop by Stability AI',
    description: 'AI-powered image editing tools. Background removal, upscaling, and more.',
    url: 'https://clipdrop.co/',
    category: 'image-gen',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 65,
    language: null, tags: ['Image Editing', 'AI Tools'], isPremium: true,
  },

  // === Data Visualization ===
  {
    id: 'curated-streamlit',
    name: 'Streamlit',
    description: 'Build data apps in minutes. Open-source framework for ML and data science web apps.',
    url: 'https://streamlit.io/',
    category: 'data-viz',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 65,
    language: null, tags: ['Dashboard', 'Web App', 'Data Science'], isPremium: true,
  },
  {
    id: 'curated-gradio',
    name: 'Gradio',
    description: 'Build ML demo apps in minutes. Easy UI for models with Python.',
    url: 'https://www.gradio.app/',
    category: 'data-viz',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 72,
    language: null, tags: ['Demo', 'UI', 'ML'], isPremium: true,
  },

  // === Workflow / Automation ===
  {
    id: 'curated-n8n',
    name: 'n8n Workflow Automation',
    description: 'Fair-code workflow automation tool. Connect apps and data sources with a visual builder.',
    url: 'https://n8n.io/',
    category: 'workflow',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 60,
    language: null, tags: ['Automation', 'Workflow', 'Integration'], isPremium: true,
  },
  {
    id: 'curated-make',
    name: 'Make (formerly Integromat)',
    description: 'Visual automation platform. Connect 1000+ apps and build complex workflows.',
    url: 'https://www.make.com/',
    category: 'workflow',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 58,
    language: null, tags: ['Automation', 'Workflow', 'Integration'], isPremium: true,
  },

  // === Search / RAG ===
  {
    id: 'curated-perplexity',
    name: 'Perplexity AI',
    description: 'AI-powered search engine with real-time answers and source citations.',
    url: 'https://www.perplexity.ai/',
    category: 'search',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 90,
    language: null, tags: ['Search', 'RAG', 'Chat'], isPremium: true,
  },

  // === Audio Generation ===
  {
    id: 'curated-suno',
    name: 'Suno AI',
    description: 'AI music generation platform. Create songs from text prompts with vocals and instruments.',
    url: 'https://suno.com/',
    category: 'audio-gen',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 88,
    language: null, tags: ['Music', 'Audio Generation', 'TTS'], isPremium: true,
  },

  // === Video Generation ===
  {
    id: 'curated-runwayml',
    name: 'Runway ML',
    description: 'Creative tools for video generation and editing. Gen-2 model for text-to-video.',
    url: 'https://runwayml.com/',
    category: 'video-gen',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 82,
    language: null, tags: ['Video', 'Gen-2', 'Creative'], isPremium: true,
  },
  {
    id: 'curated-pika',
    name: 'Pika Labs',
    description: 'AI video generation and editing. Transform text and images into dynamic videos.',
    url: 'https://www.pika.art/',
    category: 'video-gen',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 76,
    language: null, tags: ['Video', 'Animation', 'AI'], isPremium: true,
  },

  // === Agent Frameworks ===
  {
    id: 'curated-crewai',
    name: 'CrewAI',
    description: 'Framework for multi-agent orchestration. Role-based AI teams for complex tasks.',
    url: 'https://www.crewai.com/',
    category: 'agent',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 82,
    language: null, tags: ['Agent', 'Multi-Agent', 'Framework'], isPremium: true,
  },
  {
    id: 'curated-autogen',
    name: 'AutoGen by Microsoft',
    description: 'Framework for building LLM applications with conversational agents.',
    url: 'https://github.com/microsoft/autogen',
    category: 'agent',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 78,
    language: null, tags: ['Agent', 'Microsoft', 'Framework'], isPremium: true,
  },

  // === Other / General AI Resources ===
  {
    id: 'curated-ai-weekly',
    name: 'AI Weekly Newsletter',
    description: 'Curated weekly newsletter covering the latest in AI research, tools, and industry news.',
    url: 'https://aiweekly.news/',
    category: 'other',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 50,
    language: null, tags: ['Newsletter', 'News', 'Research'], isPremium: true,
  },
  {
    id: 'curated-ai-jobs-de',
    name: 'AI Jobs by DE',
    description: 'Remote AI jobs board. Curated positions in ML, data science, and AI engineering.',
    url: 'https://aijobs.dev/',
    category: 'other',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 55,
    language: null, tags: ['Jobs', 'Career', 'AI'], isPremium: true,
  },
  {
    id: 'curated-papers-with-code',
    name: 'Papers With Code',
    description: 'Track AI research papers with code implementations. SOTA benchmarks and datasets.',
    url: 'https://paperswithcode.com/',
    category: 'other',
    source: 'curated' as const,
    stars: 0, forks: 0, downloads: 0, likes: 85,
    language: null, tags: ['Research', 'Papers', 'Code'], isPremium: true,
  },
];

// ---------------------------------------------------------------------------
// Insert curated websites into the database
// ---------------------------------------------------------------------------
export function seedCuratedWebsites(): { inserted: number; skipped: number } {
  let inserted = 0;
  let skipped = 0;

  for (const site of CURATED_WEBSITES) {
    try {
      toolDb.upsert(site);
      inserted++;
    } catch (err) {
      console.error(`[Seed Data] Error inserting "${site.name}":`, err);
      skipped++;
    }
  }

  console.log(`[Seed Data] Done — ${inserted} curated websites inserted, ${skipped} skipped.`);
  return { inserted, skipped };
}
