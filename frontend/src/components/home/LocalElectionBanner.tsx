import Link from "next/link";

function getDDay(): string {
  const target = new Date("2026-06-03T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-Day";
  return `D+${Math.abs(diff)}`;
}

function getRegistrationStatus(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const regStart = new Date(2026, 4, 14);
  const regEnd = new Date(2026, 4, 16);
  if (now < regStart) return "5/14~15 후보등록 시작";
  if (now < regEnd) return "후보등록 진행 중";
  return "후보등록 마감";
}

// 6/3 18시 본투표 마감 — 이후엔 배너를 개표 현황 종합으로 전환
const COUNTING_FROM = new Date(2026, 5, 3, 18, 0, 0);

export default function LocalElectionBanner() {
  const dday = getDDay();
  const isCounting = new Date() >= COUNTING_FROM;

  // 개표 단계: 배너를 개표 현황 종합 페이지로 유도. 그 전엔 기존대로 메인으로.
  const href = isCounting ? "/local-elections/2026/results" : "/local-elections/2026";
  const badge = isCounting ? "개표" : dday;
  const subtitle = isCounting
    ? "시도지사·기초단체장·재보궐 개표 결과를 한곳에서 · 당선 결과 포함"
    : `${getRegistrationStatus()} · 광역단체장·기초단체장·교육감·광역의원·기초의원`;
  const cta = isCounting ? "개표 결과 →" : "보기 →";

  return (
    <section>
      <Link
        href={href}
        className="group block overflow-hidden rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 transition-colors hover:border-rose-300 dark:border-rose-900/40 dark:from-rose-950/30 dark:to-orange-950/30 dark:hover:border-rose-700"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
              {badge}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-(--color-text-primary) sm:text-lg">
                {isCounting ? "6·3 지방선거 개표 결과" : "6·3 전국동시지방선거"}
              </h2>
              <p className="mt-0.5 truncate text-xs text-(--color-text-secondary) sm:text-sm">
                {subtitle}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium text-rose-500 transition-transform group-hover:translate-x-0.5">
            {cta}
          </span>
        </div>
      </Link>
    </section>
  );
}
