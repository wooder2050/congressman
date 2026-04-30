import Link from "next/link";
import { getAllWeeklyArticles } from "@/data/weekly";

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  passed: {
    text: "통과",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  committee: {
    text: "심사중",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  pending: {
    text: "계류",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  },
  rejected: {
    text: "폐기",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

export default function LatestWeeklyNews() {
  const articles = getAllWeeklyArticles();
  const latest = articles[0];

  if (!latest) return null;

  const statItems = [
    latest.stats?.billsPassed != null && {
      value: latest.stats.billsPassed,
      label: "통과 법안",
    },
    latest.stats?.votesHeld != null && {
      value: latest.stats.votesHeld,
      label: "표결",
    },
    latest.stats?.committeeMeetings != null && {
      value: latest.stats.committeeMeetings,
      label: "위원회",
    },
  ].filter(Boolean) as { value: number; label: string }[];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">주간 국회 뉴스</h2>
        <Link href="/weekly" className="text-sm font-semibold text-(--color-primary) no-underline">
          주간뉴스 전체 보기 →
        </Link>
      </div>

      <Link
        href={`/weekly/${latest.id}`}
        className="block rounded-xl border border-(--color-border) bg-(--color-bg-secondary) no-underline transition-colors hover:border-(--color-primary)"
      >
        {/* 상단: 제목 + 기간 */}
        <div className="p-4 pb-3 sm:p-5 sm:pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="rounded-md bg-(--color-primary) px-2 py-0.5 text-xs font-bold text-white">
              최신
            </span>
            <span className="text-sm font-bold text-(--color-text-primary) sm:text-base">
              {latest.title}
            </span>
            <span className="text-xs text-(--color-text-tertiary)">{latest.period}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
            {latest.summary}
          </p>

          {/* 통계: 모바일은 가로 인라인, 데스크탑은 그리드 */}
          {statItems.length > 0 && (
            <div className="mt-3 flex gap-2">
              {statItems.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-lg bg-(--color-bg-primary) px-2 py-1.5 text-center sm:px-3"
                >
                  <div className="text-base font-bold text-(--color-primary) sm:text-lg">
                    {s.value}
                  </div>
                  <div className="text-[10px] text-(--color-text-tertiary)">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 중간: 주요 법안 목록 */}
        <div className="border-t border-(--color-border) px-4 py-3 sm:px-5">
          <div className="mb-2 text-xs font-semibold text-(--color-text-tertiary)">주요 법안</div>
          <div className="space-y-2">
            {latest.featuredBills.slice(0, 3).map((bill) => {
              const status = STATUS_LABEL[bill.status];
              return (
                <div key={bill.title} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${status.className}`}
                  >
                    {status.text}
                  </span>
                  <span className="line-clamp-1 text-sm text-(--color-text-primary)">
                    {bill.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단: 분석 미리보기 + 태그 */}
        <div className="border-t border-(--color-border) px-4 py-3 sm:px-5">
          {latest.analysis && (
            <p className="line-clamp-2 text-sm leading-relaxed text-(--color-text-secondary)">
              {latest.analysis}
            </p>
          )}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {latest.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-(--color-bg-primary) px-2 py-0.5 text-[11px] text-(--color-text-tertiary)"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-xs font-semibold text-(--color-primary)">
              이번 주 뉴스 읽기 →
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
