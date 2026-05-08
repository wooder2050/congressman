import Link from "next/link";
import { getBreakingNews } from "@/lib/api";

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

export default async function BreakingNewsBanner() {
  const news = await getBreakingNews();

  if (news.length === 0) return null;

  const lead = news[0];
  const rest = news.slice(1, 4);
  const leadCat = CATEGORY_STYLE[lead.category] ?? CATEGORY_STYLE.politics;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">속보</h2>
        <Link
          href="/today"
          className="text-sm font-semibold text-(--color-primary) no-underline"
        >
          전체 보기 →
        </Link>
      </div>

      {/* Lead 카드: 본문 2~3줄 요약. 상세 항목·출처는 /today에서 */}
      <article className="overflow-hidden rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-950/30">
        <div className="px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75 motion-safe:animate-ping motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${leadCat.className}`}
            >
              {leadCat.label}
            </span>
            <time className="ml-auto shrink-0 text-[11px] text-amber-600/70 dark:text-amber-400/50">
              {lead.date}
            </time>
          </div>
          {lead.linkUrl ? (
            <Link href={lead.linkUrl} className="block no-underline">
              <h3 className="mt-1.5 text-sm font-bold text-amber-900 sm:text-base dark:text-amber-100">
                {lead.title}
              </h3>
            </Link>
          ) : (
            <h3 className="mt-1.5 text-sm font-bold text-amber-900 sm:text-base dark:text-amber-100">
              {lead.title}
            </h3>
          )}
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-amber-800/80 sm:text-sm dark:text-amber-200/70">
            {lead.description}
          </p>
        </div>
      </article>

      {/* Compact 행: 제목·카테고리·날짜만 */}
      {rest.length > 0 && (
        <ul className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
          {rest.map((item) => {
            const cat = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE.politics;
            const titleNode = (
              <p className="line-clamp-1 flex-1 text-sm text-(--color-text-primary)">
                {item.title}
              </p>
            );
            return (
              <li key={item.id}>
                {item.linkUrl ? (
                  <Link
                    href={item.linkUrl}
                    className="flex items-center gap-2 px-4 py-2.5 no-underline transition-colors hover:bg-(--color-bg-hover) sm:px-5"
                  >
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${cat.className}`}
                    >
                      {cat.label}
                    </span>
                    {titleNode}
                    <time className="shrink-0 text-[11px] text-(--color-text-tertiary)">
                      {item.date.slice(5)}
                    </time>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 sm:px-5">
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${cat.className}`}
                    >
                      {cat.label}
                    </span>
                    {titleNode}
                    <time className="shrink-0 text-[11px] text-(--color-text-tertiary)">
                      {item.date.slice(5)}
                    </time>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
