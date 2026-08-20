import Link from "next/link";
import { getHomePicks } from "@/data/editors-picks";
import TrackedLink from "@/components/analytics/TrackedLink";

const CATEGORY_STYLE: Record<string, string> = {
  입법: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  선거: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  인사: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  정당: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "국회 운영": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

/**
 * 편집자가 고른 국회 분석 — 자체 작성 주간뉴스 기사 중 편집 선별 6편.
 * 데이터 나열이 아닌 해설·분석 콘텐츠를 홈 상단에서 바로 발견할 수 있게 한다.
 */
export default function EditorsPicks() {
  const picks = getHomePicks();
  if (picks.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">편집자가 고른 국회 분석</h2>
        <Link href="/weekly" className="text-sm font-semibold text-(--color-primary) no-underline">
          분석 전체 보기 →
        </Link>
      </div>
      <p className="text-sm text-(--color-text-tertiary)">
        lawmake 편집팀이 직접 쓰고 고른 심층 기사입니다. 지금 정국을 이해하는 데 필요한 순서로
        골랐습니다.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((pick, i) => (
          <TrackedLink
            key={pick.href}
            href={pick.href}
            eventName="editors_pick_click"
            eventParams={{ component: "home_editors_picks", article_id: pick.href, position: i }}
            impressionParams={{
              component: "home_editors_picks",
              article_id: pick.href,
              position: i,
            }}
            className="flex flex-col rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:border-(--color-primary)"
          >
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${CATEGORY_STYLE[pick.category] ?? ""}`}
              >
                {pick.category}
              </span>
              <span className="text-xs text-(--color-text-tertiary)">{pick.date}</span>
            </div>
            <p className="mt-2 leading-snug font-bold text-(--color-text-primary)">{pick.title}</p>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-(--color-text-secondary)">
              {pick.why}
            </p>
          </TrackedLink>
        ))}
      </div>
    </section>
  );
}
