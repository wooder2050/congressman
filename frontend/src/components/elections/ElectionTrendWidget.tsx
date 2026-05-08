import Link from "next/link";
import { getBreakingNews } from "@/lib/api";

export default async function ElectionTrendWidget() {
  const news = await getBreakingNews();
  const electionNews = news
    .filter((n) => n.category === "election" || n.category === "politics")
    .slice(0, 3);

  if (electionNews.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/20">
      <div className="flex items-center justify-between border-b border-rose-200 px-4 py-2.5 sm:px-5 dark:border-rose-900/40">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75 motion-safe:animate-ping motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
          <h2 className="text-sm font-bold text-rose-900 dark:text-rose-100">오늘의 정치 동향</h2>
        </div>
        <Link
          href="/"
          className="text-[11px] font-medium text-rose-600/70 no-underline hover:underline dark:text-rose-400/70"
        >
          전체 속보 →
        </Link>
      </div>
      <ul className="divide-y divide-rose-200/70 dark:divide-rose-900/30">
        {electionNews.map((item) => (
          <li key={item.id} className="px-4 py-2.5 sm:px-5">
            <div className="flex items-baseline gap-2">
              <time className="shrink-0 text-[11px] font-medium text-rose-600/70 dark:text-rose-400/60">
                {item.date.slice(5).replace("-", "/")}
              </time>
              <p className="text-xs leading-snug text-rose-900 sm:text-sm dark:text-rose-100">
                {item.title}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
