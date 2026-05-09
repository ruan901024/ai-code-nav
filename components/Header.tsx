"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const { t, locale } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          <span className="text-xl">🚀</span>
          <span>{t('siteTitle')}</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {t('home')}
          </Link>
          <Link href="/#categories" className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {t('categories')}
          </Link>
          <Link href="/search" className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {t('search')}
          </Link>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Premium badge */}
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t('premium')}
          </span>
        </nav>
      </div>
    </header>
  );
}
