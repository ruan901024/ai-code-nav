import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import { toolDb, categoryDb } from "@/lib/db";
import CategoryPageClient from "./page.client";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const categories = categoryDb.getAll();
  return categories.map((cat) => ({
    id: cat.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = categoryDb.getByCategory(id);

  return {
    title: `${category?.name || "分类"} - AI 代码导航站`,
    description: category ? `${category.description} — 发现相关优质开源工具。` : "浏览该分类下的 AI 工具。",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const tools = toolDb.getByCategory(id, 50);
  const category = categoryDb.getByCategory(id);

  return <CategoryPageClient categoryId={id} tools={tools} category={category} />;
}
