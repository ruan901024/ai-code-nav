"use client";

import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import SearchBar from "@/components/SearchBar";
import type { DbTool } from "@/lib/db";
import { useI18n } from "@/components/I18nProvider";

interface SearchPageClientProps {
  query: string;
  tools: DbTool[];
}

export default function SearchPageClient({ query, tools }: SearchPageClientProps) {
  const { t, locale } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb / Back link */}
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M15.41 7.41l-6.12 6.12L15.41 19.64a1 1 0 0 0 1.42-1.41l-5.3-5.3H18V10h-6.47l5.3-5.3a1 1 0 0 0-1.42-1.41Z" />
        </svg>
        {t('home')}
      </Link>

      {/* Search bar */}
      <div className="mb-8 max-w-xl">
        <SearchBar />
      </div>

      {/* Results header */}
      {query && (
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          {t('searchResultsFor', { value: query })}
        </p>
      )}

      {/* Results list */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : query ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            {t('noResultsFound')}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('noResultsMessage', { value: query })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            {t('enterKeyword')}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('enterKeywordMessage')}
          </p>
        </div>
      )}

      {/* Result count */}
      {tools.length > 0 && (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          {t('resultsFound', { value: tools.length })}
        </p>
      )}
    </div>
  );
}
