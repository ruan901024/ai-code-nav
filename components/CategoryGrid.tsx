"use client";

import Link from "next/link";
import type { DbCategory } from "@/lib/db";
import { useI18n } from "@/components/I18nProvider";

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  toolCount: number;
}

interface CategoryGridProps {
  categories: CategoryItem[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const { cat, t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {categories.map((catItem) => {
        const translatedCat = cat(catItem.id);

        return (
          <Link
            key={catItem.id}
            href={`/category/${catItem.id}`}
            className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-5 text-center shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-600"
          >
            {/* Icon */}
            <span className="text-3xl">{catItem.icon}</span>

            {/* Name */}
            <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
              {translatedCat.name}
            </h3>

            {/* Description */}
            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {translatedCat.description}
            </p>

            {/* Tool count badge */}
            <span className="mt-1 inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {t('toolsCount', { value: catItem.toolCount })}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
