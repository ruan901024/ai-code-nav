"use client";

import { useI18n } from "@/components/I18nProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900">
      <button
        onClick={() => setLocale('zh')}
        className={`px-2 py-0.5 font-medium transition-colors ${
          locale === 'zh'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
        }`}
      >
        {t('languageZh')}
      </button>
      <span className="text-zinc-300 dark:text-zinc-600">/</span>
      <button
        onClick={() => setLocale('en')}
        className={`px-2 py-0.5 font-medium transition-colors ${
          locale === 'en'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
        }`}
      >
        {t('languageEn')}
      </button>
    </div>
  );
}
