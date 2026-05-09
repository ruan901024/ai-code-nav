"use client";

import { useState } from "react";
import ToolCard from "@/components/ToolCard";
import type { DbTool } from "@/lib/db";
import { useI18n } from "@/components/I18nProvider";

interface HotPageClientProps {
  tools: DbTool[];
}

export default function HotPageClient({ tools }: HotPageClientProps) {
  const { t } = useI18n();
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Filter tools by source
  const filteredTools = sourceFilter === 'all' 
    ? tools 
    : tools.filter(tool => tool.source === sourceFilter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero section */}
      <section className="mb-10 flex flex-col items-center gap-6 text-center sm:gap-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl">
          {t('hotPageTitle')}
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
          {t('hotPageSubtitle')}
        </p>
      </section>

      {/* Source filter */}
      <section className="mb-8 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('sourceFilter')}:</span>
        
        <button
          onClick={() => setSourceFilter('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            sourceFilter === 'all'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {t('allSources')}
        </button>

        <button
          onClick={() => setSourceFilter('github')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            sourceFilter === 'github'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {t('githubTrending')}
        </button>

        <button
          onClick={() => setSourceFilter('hackernews')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            sourceFilter === 'hackernews'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {t('hackerNews')}
        </button>

        <button
          onClick={() => setSourceFilter('producthunt')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            sourceFilter === 'producthunt'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {t('productHunt')}
        </button>

        <button
          onClick={() => setSourceFilter('huggingface')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            sourceFilter === 'huggingface'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {t('huggingface')}
        </button>
      </section>

      {/* Tools grid */}
      <section className="mb-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Empty state */}
        {filteredTools.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="text-4xl">🔍</span>
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">{t('noResultsFound')}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('enterKeywordMessage')}</p>
          </div>
        )}
      </section>

      {/* Stats */}
      {filteredTools.length > 0 && (
        <section className="flex items-center justify-center gap-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{t('resultsFound', { value: filteredTools.length })}</span>
        </section>
      )}
    </div>
  );
}
