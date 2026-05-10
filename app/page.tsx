import type { Metadata } from "next";
import { toolDb, categoryDb, postDb } from "@/lib/db";
import { seedCuratedWebsites } from "@/lib/seed-data";
import HomePageClient from "./page.client";

export const metadata: Metadata = {
  title: "首页 - AI 代码导航站",
  description: "发现最佳 AI 开源工具 — Agent、视频生成、代码辅助、图像生成、大语言模型等分类浏览。",
};

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  toolCount: number;
}

export default function HomePage() {
  // Server-side data fetching
  
  // Seed curated websites (idempotent)
  seedCuratedWebsites();
  
  const tools = toolDb.getAll(12, 0);
  const categoriesRaw = categoryDb.getAll();
  
  // Add tool counts to categories
  const categories: CategoryItem[] = categoriesRaw.map(cat => ({
    ...cat,
    toolCount: toolDb.countByCategory(cat.id),
  }));

  // Fetch trending posts (HN + PH) for the embedded section
  const trendingPosts = postDb.getAll(8, 0);

  // Fetch curated/recommended tools
  const recommendedTools = toolDb.getAll(12, 0).filter(t => t.source === 'curated');

  return <HomePageClient tools={tools} categories={categories} trendingPosts={trendingPosts} recommendedTools={recommendedTools} />;
}
