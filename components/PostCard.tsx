"use client";

import type { DbPost } from "@/lib/db";

interface PostCardProps {
  post: DbPost;
}

const SOURCE_STYLES = {
  hackernews: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    label: "HN",
  },
  producthunt: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    label: "PH",
  },
  arxiv: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    label: "arXiv",
  },
  reddit: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    label: "Reddit",
  },
};

export default function PostCard({ post }: PostCardProps) {
  const style = SOURCE_STYLES[post.source as keyof typeof SOURCE_STYLES] ?? {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-700 dark:text-zinc-300",
    label: post.source,
  };

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-start gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 sm:p-4"
    >
      {/* Header row with source badge and title */}
      <div className="flex w-full items-start gap-2">
        <span
          className={`flex-shrink-none rounded-full px-2 py-1 text-xs font-medium ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>

        <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400 sm:text-base">
          {post.title}
        </h3>
      </div>

      {/* AI-generated content summary */}
      {post.content && post.content !== '' && (
        <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">
          {post.content}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
        <span title={`${post.score} upvotes`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-orange-500 sm:h-4 sm:w-4">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="ml-1">{post.score}</span>
        </span>

        {post.comments > 0 && (
          <span title={`${post.comments} comments`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4">
              <path d="M20 2c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h16zm-7 13c0 1.65-1.35 3-3 3s-3-1.35-3-3 1.35-3 3-3 3 1.35 3 3zm4-4c0 1.65-1.35 3-3 3s-3-1.35-3-3 1.35-3 3-3 3 1.35 3 3z" />
            </svg>
            <span className="ml-1">{post.comments}</span>
          </span>
        )}

        {/* External link icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity sm:h-4 sm:w-4">
          <path d="M19 19H5V5h7.55c.79-1.25 2.3-2 4.45-2 2.21 0 4 1.79 4 4v1.59c.67.19 1.35.58 1.94 1.16C23.58 11.02 24 12.4 24 14v7H19zm-2-7h-2V6c0-.55-.45-1-1-1s-1 .45-1 1v6h-2c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1zm-7-8H7v2h3V4z" />
        </svg>
      </div>
    </a>
  );
}
