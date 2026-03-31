import Link from "next/link";
import { getActiveBreakingNews } from "@/data/breaking-news";

const CATEGORY_STYLE: Record<string, { label: string; className: string }> = {
  committee: {
    label: "국회",
    className: "bg-amber-500 text-white",
  },
  election: {
    label: "선거",
    className: "bg-rose-500 text-white",
  },
  legislation: {
    label: "입법",
    className: "bg-blue-500 text-white",
  },
  politics: {
    label: "정치",
    className: "bg-violet-500 text-white",
  },
};

export default function BreakingNewsBanner() {
  const news = getActiveBreakingNews();

  if (news.length === 0) return null;

  return (
    <section className="space-y-3">
      {news.map((item) => {
        const cat = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE.politics;

        return (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-950/30"
          >
            {/* 상단 헤더 */}
            <div className="px-4 pt-4 pb-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                </span>
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${cat.className}`}
                >
                  {cat.label}
                </span>
                <time className="ml-auto shrink-0 text-[11px] text-amber-600/70 dark:text-amber-400/50">
                  {item.date}
                </time>
              </div>
              <h3 className="mt-1.5 text-sm font-bold text-amber-900 sm:text-base dark:text-amber-100">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-amber-800/80 sm:text-sm dark:text-amber-200/70">
                {item.description}
              </p>
            </div>

            {/* 상세 항목 */}
            {item.items && item.items.length > 0 && (
              <div className="border-t border-amber-200 px-4 py-3 sm:px-5 dark:border-amber-800/40">
                <div className="grid gap-2 sm:grid-cols-2">
                  {item.items.map((detail) => (
                    <div
                      key={detail.label}
                      className="rounded-lg bg-white/60 px-3 py-2 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          {detail.label}
                        </span>
                        {detail.memberId && (
                          <Link
                            href={`/members/${detail.memberId}`}
                            className="shrink-0 text-[11px] font-medium text-amber-600 no-underline hover:underline dark:text-amber-400"
                          >
                            프로필 →
                          </Link>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-amber-900/70 dark:text-amber-100/60">
                        {detail.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 출처 */}
            {item.sources && item.sources.length > 0 && (
              <div className="border-t border-amber-200 px-4 py-1.5 sm:px-5 dark:border-amber-800/40">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-[10px] text-amber-600/50 dark:text-amber-400/40">출처</span>
                  {item.sources.map((src, i) => (
                    <span
                      key={src.url}
                      className="text-[10px] text-amber-600/50 dark:text-amber-400/40"
                    >
                      {i > 0 && <span className="mr-2">·</span>}
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline hover:underline"
                      >
                        {src.title}
                      </a>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
