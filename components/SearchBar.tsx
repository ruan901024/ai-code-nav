"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

export default function SearchBar() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <form
      action={(formData: FormData) => {
        const query = formData.get("query") as string;
        if (query.trim()) {
          router.push(`/search?query=${encodeURIComponent(query.trim())}`);
        }
      }}
      className="relative w-full"
    >
      <input
        type="text"
        name="query"
        placeholder={t('searchPlaceholder')}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm leading-relaxed shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-blue-400"
      />

      {/* Search icon */}
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          <path d="M10.5 21.75c-4.97 0-9-4.03-9-9 0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9s-4.03 9-9 9Zm0-16.5c-4.13 0-7.5 3.37-7.5 7.5s3.37 7.5 7.5 7.5 7.5-3.37 7.5-7.5-3.37-7.5-7.5-7.5Zm-.75 4.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
        </svg>
      </button>
    </form>
  );
}
