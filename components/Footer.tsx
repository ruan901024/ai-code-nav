"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* Copyright */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('footerCopyright')}
        </p>

        {/* Links */}
        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:underline hover:text-zinc-900 dark:hover:text-zinc-50">
            {t('home')}
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <Link href="/#categories" className="hover:underline hover:text-zinc-900 dark:hover:text-zinc-50">
            {t('categories')}
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <Link href="/search" className="hover:underline hover:text-zinc-900 dark:hover:text-zinc-50">
            {t('search')}
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <Link href="/hot" className="hover:underline hover:text-zinc-900 dark:hover:text-zinc-50">
            {t('hot')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
