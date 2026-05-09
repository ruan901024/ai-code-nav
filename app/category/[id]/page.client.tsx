"use client";

import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import type { DbTool, DbCategory } from "@/lib/db";
import { useI18n } from "@/components/I18nProvider";

interface CategoryPageClientProps {
  categoryId: string;
  tools: DbTool[];
  category: DbCategory | undefined;
}

export default function CategoryPageClient({ categoryId, tools, category }: CategoryPageClientProps) {
  const { t, cat, locale } = useI18n();
  // Get translated category info
  const translatedCat = cat(categoryId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb / Back link */}
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M15.41 7.41l-6.12 6.12L15.41 19.64a1 1 0 0 0 1.42-1.41l-5.3-5.3H18V10h-6.47l5.3-5.3a1 1 0 0 0-1.42-1.41Z" />
        </svg>
        {t('home')}
      </Link>

      {/* Category header */}
      {category && (
        <div className="mb-8 flex items-center gap-4">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {translatedCat.name}
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {translatedCat.description}
            </p>
          </div>
        </div>
      )}

      {/* Tools list */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">📭</span>
          <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            {t('noResultsFound')}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {locale === 'zh' ? '该分类下还没有收录任何 AI 工具。' : 'No AI tools in this category yet.'}
          </p>
        </div>
      )}

      {/* Tool count */}
      {tools.length > 0 && (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          {locale === 'zh' ? `共收录 ${tools.length} 个工具` : `${tools.length} tools in this category`}
        </p>
      )}
    </div>
  );
}
