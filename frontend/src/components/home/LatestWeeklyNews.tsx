import Link from "next/link";
import { getAllWeeklyArticles } from "@/data/weekly";

export default function LatestWeeklyNews() {
  const articles = getAllWeeklyArticles();
  const latest = articles[0];

  if (!latest) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">주간 국회 뉴스</h2>
        <Link href="/weekly" className="text-sm font-semibold text-(--color-primary) no-underline">
          전체 보기 →
        </Link>
      </div>
      <Link
        href={`/weekly/${latest.id}`}
        className="block rounded-xl border border-(--color-border) bg-(--color-bg-secondary) p-5 no-underline transition-colors hover:border-(--color-primary)"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-(--color-primary) px-2 py-0.5 text-xs font-bold text-white">
                최신
              </span>
              <span className="text-sm font-semibold text-(--color-text-primary)">
                {latest.title}
              </span>
              <span className="text-xs text-(--color-text-tertiary)">{latest.period}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              {latest.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {latest.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-(--color-bg-primary) px-2.5 py-0.5 text-xs text-(--color-text-tertiary)"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          {latest.stats && (
            <div className="hidden shrink-0 grid-cols-1 gap-1.5 text-center sm:grid">
              {latest.stats.billsPassed != null && (
                <div className="rounded-lg bg-(--color-bg-primary) px-3 py-1.5">
                  <div className="text-lg font-bold text-(--color-primary)">
                    {latest.stats.billsPassed}
                  </div>
                  <div className="text-[10px] text-(--color-text-tertiary)">통과 법안</div>
                </div>
              )}
              {latest.stats.votesHeld != null && (
                <div className="rounded-lg bg-(--color-bg-primary) px-3 py-1.5">
                  <div className="text-lg font-bold text-(--color-primary)">
                    {latest.stats.votesHeld}
                  </div>
                  <div className="text-[10px] text-(--color-text-tertiary)">표결</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </section>
  );
}
