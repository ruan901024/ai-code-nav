import type { Metadata } from "next";
import { toolDb } from "@/lib/db";
import HotPageClient from "./page.client";

export const metadata: Metadata = {
  title: "热点追踪 - AI 代码导航站",
  description: "来自 Hacker News、Product Hunt 和 GitHub Trending 的最新 AI 动态。",
};

export default function HotPage() {
  // Server-side data fetching — get all tools sorted by stars (score) descending
  const tools = toolDb.getAll(50, 0);

  return <HotPageClient tools={tools} />;
}
