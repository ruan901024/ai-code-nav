// @ts-nocheck — better-sqlite3 types conflict with esModuleInterop
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

type DB = typeof Database;

// Singleton pattern for better-sqlite3
let db: DB | null = null;

export type DbInstance = ReturnType<typeof getDb>;

export function getDb(): DB {
  if (!db) {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'ai-nav.db');
    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        url TEXT NOT NULL UNIQUE,
        category TEXT DEFAULT 'other',
        source TEXT DEFAULT 'github',
        stars INTEGER DEFAULT 0,
        forks INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        language TEXT,
        tags TEXT DEFAULT '[]',
        is_premium INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        icon TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        source TEXT DEFAULT 'hackernews',
        score INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        content TEXT DEFAULT '',
        published_at TEXT DEFAULT (datetime('now')),
        fetched_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
      CREATE INDEX IF NOT EXISTS idx_tools_stars ON tools(stars DESC);
      CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name);
      CREATE INDEX IF NOT EXISTS idx_tools_source ON tools(source);
      CREATE INDEX IF NOT EXISTS idx_posts_score ON posts(score DESC);
      CREATE INDEX IF NOT EXISTS idx_posts_fetched_at ON posts(fetched_at DESC);
    `);

    // Migration: add new columns if they don't exist (for existing databases)
    const migrate = (sql: string) => {
      try {
        db!.exec(sql);
      } catch (e) {
        // ignore duplicate column errors
      }
    };
    migrate(`ALTER TABLE tools ADD COLUMN source TEXT DEFAULT 'github'`);
    migrate(`ALTER TABLE tools ADD COLUMN downloads INTEGER DEFAULT 0`);
    migrate(`ALTER TABLE tools ADD COLUMN likes INTEGER DEFAULT 0`);

    // Migration: add content column to posts if it doesn't exist
    migrate(`ALTER TABLE posts ADD COLUMN content TEXT DEFAULT ''`);

    // Seed default categories if empty
    const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    if ((count as { count: number }).count === 0) {
      const insert = db.prepare(
        'INSERT OR IGNORE INTO categories (id, name, description, icon) VALUES (?, ?, ?, ?)'
      );
      const defaultCategories = [
        { id: 'agent', name: 'AI Agent', description: '智能体框架与平台', icon: '🤖' },
        { id: 'video-gen', name: 'Video Generator', description: '视频生成工具', icon: '🎬' },
        { id: 'code-assist', name: 'Code Assistant', description: '代码辅助工具', icon: '💻' },
        { id: 'image-gen', name: 'Image Generator', description: '图像生成工具', icon: '🎨' },
        { id: 'llm', name: 'Large Language Model', description: '大语言模型', icon: '🧠' },
        { id: 'data-viz', name: 'Data Visualization', description: '数据可视化工具', icon: '📊' },
        { id: 'audio-gen', name: 'Audio Generator', description: '音频生成工具', icon: '🎵' },
        { id: 'workflow', name: 'Workflow Automation', description: '工作流自动化', icon: '⚡' },
        { id: 'search', name: 'AI Search', description: '智能搜索引擎', icon: '🔍' },
        { id: 'other', name: 'Other AI Tools', description: '其他AI工具', icon: '📦' },
      ];
      defaultCategories.forEach((cat) => insert.run(cat.id, cat.name, cat.description, cat.icon));
    }
  }
  return db!;
}

export interface DbTool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  source: 'github' | 'huggingface' | 'hackernews' | 'producthunt' | 'curated';
  stars: number;
  forks: number;
  downloads: number;
  likes: number;
  language: string | null;
  tags: string[];
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Tool CRUD operations
export const toolDb = {
  getAll(limit = 50, offset = 0): DbTool[] {
    const stmt = getDb().prepare(
      'SELECT * FROM tools ORDER BY stars DESC LIMIT ? OFFSET ?'
    );
    return stmt.all(limit, offset).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      url: row.url,
      category: row.category,
      source: row.source || 'github',
      stars: row.stars,
      forks: row.forks,
      downloads: row.downloads ?? 0,
      likes: row.likes ?? 0,
      language: row.language,
      tags: JSON.parse(row.tags || '[]'),
      isPremium: !!row.is_premium,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) as DbTool[];
  },

  getByCategory(category: string, limit = 50): DbTool[] {
    const stmt = getDb().prepare(
      'SELECT * FROM tools WHERE category = ? ORDER BY stars DESC LIMIT ?'
    );
    return stmt.all(category, limit).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      url: row.url,
      category: row.category,
      source: row.source || 'github',
      stars: row.stars,
      forks: row.forks,
      downloads: row.downloads ?? 0,
      likes: row.likes ?? 0,
      language: row.language,
      tags: JSON.parse(row.tags || '[]'),
      isPremium: !!row.is_premium,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) as DbTool[];
  },

  search(query: string, limit = 50): DbTool[] {
    const stmt = getDb().prepare(
      'SELECT * FROM tools WHERE name LIKE ? OR description LIKE ? ORDER BY stars DESC LIMIT ?'
    );
    return stmt.all(`%${query}%`, `%${query}%`, limit).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      url: row.url,
      category: row.category,
      source: row.source || 'github',
      stars: row.stars,
      forks: row.forks,
      downloads: row.downloads ?? 0,
      likes: row.likes ?? 0,
      language: row.language,
      tags: JSON.parse(row.tags || '[]'),
      isPremium: !!row.is_premium,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) as DbTool[];
  },

  upsert(tool: Omit<DbTool, 'createdAt' | 'updatedAt'>): void {
    const stmt = getDb().prepare(`
      INSERT OR REPLACE INTO tools 
      (id, name, description, url, category, source, stars, forks, downloads, likes, language, tags, is_premium)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      tool.id,
      tool.name,
      tool.description,
      tool.url,
      tool.category,
      tool.source || 'github',
      tool.stars,
      tool.forks,
      tool.downloads ?? 0,
      tool.likes ?? 0,
      tool.language || null,
      JSON.stringify(tool.tags),
      tool.isPremium ? 1 : 0
    );
  },

  count(): number {
    const result = getDb().prepare('SELECT COUNT(*) as count FROM tools').get();
    return (result as { count: number }).count;
  },

  countByCategory(category: string): number {
    const result = getDb().prepare('SELECT COUNT(*) as count FROM tools WHERE category = ?').get(category);
    return (result as { count: number }).count;
  },
};

// Category operations
export const categoryDb = {
  getAll(): DbCategory[] {
    return getDb().prepare('SELECT * FROM categories ORDER BY name').all() as DbCategory[];
  },

  getByCategory(categoryId: string): DbCategory | undefined {
    return getDb().prepare('SELECT * FROM categories WHERE id = ?').get(categoryId) as DbCategory | undefined;
  },
};

// Post interface and CRUD operations
export interface DbPost {
  id: string;
  title: string;
  url: string;
  source: 'hackernews' | 'producthunt' | 'arxiv' | 'reddit';
  score: number;
  comments: number;
  content: string;
  publishedAt: string;
  fetchedAt: string;
}

export const postDb = {
  getAll(limit = 50, offset = 0): DbPost[] {
    const stmt = getDb().prepare(
      'SELECT * FROM posts ORDER BY score DESC LIMIT ? OFFSET ?'
    );
    return stmt.all(limit, offset).map(row => ({
      id: row.id,
      title: row.title,
      url: row.url,
      source: row.source || 'hackernews',
      score: row.score,
      comments: row.comments ?? 0,
      content: row.content || '',
      publishedAt: row.published_at,
      fetchedAt: row.fetched_at,
    })) as DbPost[];
  },

  getBySource(source: string, limit = 50): DbPost[] {
    const stmt = getDb().prepare(
      'SELECT * FROM posts WHERE source = ? ORDER BY score DESC LIMIT ?'
    );
    return stmt.all(source, limit).map(row => ({
      id: row.id,
      title: row.title,
      url: row.url,
      source: row.source || 'hackernews',
      score: row.score,
      comments: row.comments ?? 0,
      content: row.content || '',
      publishedAt: row.published_at,
      fetchedAt: row.fetched_at,
    })) as DbPost[];
  },

  upsert(post: Omit<DbPost, 'publishedAt' | 'fetchedAt'>): void {
    const stmt = getDb().prepare(`
      INSERT OR REPLACE INTO posts 
      (id, title, url, source, score, comments, content)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      post.id,
      post.title,
      post.url,
      post.source || 'hackernews',
      post.score,
      post.comments ?? 0,
      post.content || ''
    );
  },

  count(): number {
    const result = getDb().prepare('SELECT COUNT(*) as count FROM posts').get();
    return (result as { count: number }).count;
  },
};