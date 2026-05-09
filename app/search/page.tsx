import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import SearchBar from "@/components/SearchBar";
import { toolDb } from "@/lib/db";
import SearchPageClient from "./page.client";

interface SearchPageProps {
  searchParams: Promise<{ query?: string }>;
}

export const metadata: Metadata = {
  title: "搜索结果 - AI 代码导航站",
  description: "搜索 AI 开源工具。",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.query || "";
  const tools = toolDb.search(query, 50);

  return <SearchPageClient query={query} tools={tools} />;
}
