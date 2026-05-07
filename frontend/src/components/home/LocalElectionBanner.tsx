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

export default function LocalElectionBanner() {
  const dday = getDDay();
  const regStatus = getRegistrationStatus();

  return (
    <section>
      <Link
        href="/local-elections/2026"
        className="group block overflow-hidden rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 transition-colors hover:border-rose-300 dark:border-rose-900/40 dark:from-rose-950/30 dark:to-orange-950/30 dark:hover:border-rose-700"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
              {dday}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-(--color-text-primary) sm:text-lg">
                6·3 전국동시지방선거
              </h2>
              <p className="mt-0.5 truncate text-xs text-(--color-text-secondary) sm:text-sm">
                {regStatus} · 광역단체장·기초단체장·교육감·광역의원·기초의원
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium text-rose-500 transition-transform group-hover:translate-x-0.5">
            보기 &rarr;
          </span>
        </div>
      </Link>
    </section>
  );
}
