"use client";

import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ToolCard from "@/components/ToolCard";
import PostCard from "@/components/PostCard";
import CategoryGrid from "@/components/CategoryGrid";
import type { DbTool, DbPost } from "@/lib/db";
import { useI18n } from "@/components/I18nProvider";

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  toolCount: number;
}

interface HomePageClientProps {
  tools: DbTool[];
  categories: CategoryItem[];
  trendingPosts?: DbPost[];
  recommendedTools?: DbTool[];
}

export default function HomePageClient({ tools, categories, trendingPosts, recommendedTools }: HomePageClientProps) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero section */}
      <section className="mb-10 flex flex-col items-center gap-6 text-center sm:gap-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl">
          {t('heroTitle')}
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
          {t('heroSubtitle')}
        </p>

        {/* Search bar */}
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      </section>

      {/* Recommended Websites section — curated by editors */}
      {recommendedTools && recommendedTools.length > 0 && (
        <section className="mb-12" id="recommended">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              {t('recommendedWebsites')}
            </h2>
            <Link href="/hot" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              {t('viewAllRecommended')}
            </Link>
          </div>

          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-500">
            {t('recommendedSubtitle')}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommendedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Trending section — embedded from hot page */}
      {trendingPosts && trendingPosts.length > 0 && (
        <section className="mb-12" id="trending">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              {t('trendingNow')}
            </h2>
            <Link href="/hot" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              {t('viewAllTrending')}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {trendingPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Featured tools section */}
      {tools.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            {t('hotTools')}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Category grid section */}
      <section id="categories" className="mb-12">
        <h2 className="mb-6 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
          {t('toolCategories')}
        </h2>

        <CategoryGrid categories={categories} />
      </section>
    </div>
  );
}
