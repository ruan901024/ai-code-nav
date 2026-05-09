"use client";

import type { DbTool } from "@/lib/db";
import { useI18n } from "@/components/I18nProvider";

interface ToolCardProps {
  tool: DbTool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const { cat } = useI18n();
  
  // Get translated category name
  const translatedCat = cat(tool.category);

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 sm:p-4 lg:p-5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400 sm:text-base lg:text-lg">
          {tool.name}
        </h3>

        {/* Source badge */}
        {tool.source === 'huggingface' && (
          <span className="flex-shrink-none rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" title="HuggingFace">
            HF
          </span>
        )}

        {/* Premium lock icon */}
        {tool.isPremium && (
          <span className="flex-shrink-none rounded-full bg-gradient-to-r from-amber-400 to-orange-500 p-1 shadow-sm" title="Premium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-white">
              <path d="M18 8a6 6 0 0 0-12 0c0 .74-.13 1.44-.36 2.09L6 10.5V14a6 6 0 0 0 12 0v-3.5l-1.64-.41C18.13 9.44 18 8.74 18 8Zm-6 8a4 4 0 0 1-4-4c0-.74.13-1.44.36-2.09L9 9.5V6a4 4 0 0 1 8 0v3.5l-1.64.41C13.87 10.56 14 11.26 14 12a4 4 0 0 1-2 4Z" />
            </svg>
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm lg:text-base">
        {tool.description}
      </p>

      {/* Footer row: category badge + stats */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 sm:px-2.5 lg:px-3">
          {translatedCat.name}
        </span>

        {/* Stats: stars for GitHub, downloads+likes for HF */}
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 sm:gap-2 sm:text-sm lg:gap-3">
          {tool.source === 'huggingface' ? (
            <>
              {tool.downloads > 0 && (
                <span title={`${tool.downloads} downloads`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{tool.downloads}</span>
                </span>
              )}
              {tool.likes > 0 && (
                <span title={`${tool.likes} likes`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-pink-500 sm:h-4 sm:w-4">
                    <path d="M18 8a6 6 0 0 0-12 0c0 .74-.13 1.44-.36 2.09L6 10.5V14a6 6 0 0 0 12 0v-3.5l-1.64-.41C18.13 9.44 18 8.74 18 8Zm-6 8a4 4 0 0 1-4-4c0-.74.13-1.44.36-2.09L9 9.5V6a4 4 0 0 1 8 0v3.5l-1.64.41C13.87 10.56 14 11.26 14 12a4 4 0 0 1-2 4Z" />
                  </svg>
                  <span>{tool.likes}</span>
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1" title={`${tool.stars} stars`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-yellow-500 sm:h-4 sm:w-4">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{tool.stars}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {tool.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tool.tags.map((tag) => (
            <span key={tag} className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 sm:px-2">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
