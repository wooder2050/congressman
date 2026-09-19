import Link from "next/link";
import TrackedLink from "@/components/analytics/TrackedLink";
import { CABINET_2026_08 } from "@/data/cabinet-nominees";

/**
 * 홈 진입 카드 — 2기 개각 후보자 한눈에 보기.
 * 속보 배너가 개각 뉴스를 이미 다루므로 본문을 복제하지 않고, 이 카드의 고유 가치인
 * "6명 이름 칩 → 후보자 카드 앵커"와 CTA만 둔다. EditorsPicks와 같은 섹션 문법(헤더 행 + 박스).
 * 임명·결과 확정 후에는 데이터의 showOnHome을 false로 내리면 사라진다(페이지는 아카이브로 유지).
 */
export default function CabinetNomineeSpotlight() {
  const d = CABINET_2026_08;
  if (!d.showOnHome) return null;
  // 지명·일정 확정 단계인 후보자가 하나라도 남아 있으면 청문회는 아직 '예정'이다
  const hearingsPending = d.ministers.some(
    (m) => m.status === "nominated" || m.status === "hearing_scheduled",
  );

  const memberCount = d.ministers.filter((m) => m.memberId).length;
  // 진행 중이 아닌 후보자(사퇴·지명 철회)는 칩과 요약 문구에 상태를 드러낸다 — 페이지와 동일 기준
  const ended = d.ministers.filter(
    (m) => m.status === "withdrawn" || m.status === "nomination_withdrawn",
  );
  const appointed = d.ministers.filter((m) => m.status === "appointed");
  const statusBadge = (status: string): { label: string; tone: "warn" | "done" } | null => {
    if (status === "withdrawn") return { label: "사퇴", tone: "warn" };
    if (status === "nomination_withdrawn") return { label: "지명 철회", tone: "warn" };
    if (status === "appointed") return { label: "임명", tone: "done" };
    return null;
  };

  return (
    <section aria-labelledby="cabinet-spotlight-title" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="cabinet-spotlight-title" className="text-xl font-bold">
          {d.shortTitle} — 국회에서 온 사람들
        </h2>
        <TrackedLink
          href={d.path}
          eventName="cabinet_spotlight_click"
          eventParams={{ component: "home_cabinet_spotlight", position: "header" }}
          impressionParams={{ component: "home_cabinet_spotlight" }}
          className="shrink-0 text-sm font-semibold text-(--color-primary) no-underline"
        >
          후보자 6명 자세히 보기 <span aria-hidden="true">→</span>
        </TrackedLink>
      </div>
      <p className="text-sm text-(--color-text-tertiary)">
        {d.announcedAtLabel} 지명 · 6개 부처 후보자 중 현역 의원 {memberCount}명
        {ended.length > 0 && (
          <>
            {" "}
            · {ended.map((m) => m.name).join("·")} 후보자{" "}
            {ended.length === 1 && ended[0].status === "nomination_withdrawn"
              ? "지명 철회"
              : "사퇴"}
          </>
        )}
        {appointed.length > 0 && <> · 임명 {appointed.length}명</>} ·{" "}
        {hearingsPending
          ? "인사청문회는 9월 14~18일 소관 상임위에서 열립니다."
          : "인사청문회는 9월 14~18일 소관 상임위에서 마쳤고, 임명·보고서 채택 결과를 추적합니다."}
      </p>

      <ul className="grid grid-cols-2 gap-2 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 sm:grid-cols-3">
        {d.ministers.map((m) => {
          const badge = statusBadge(m.status);
          const isEnded = badge?.tone === "warn";
          return (
            <li key={m.slug}>
              <Link
                href={`${d.path}#nominee-${m.slug}`}
                className={`flex min-h-12 items-center justify-between gap-2 rounded-lg bg-(--color-bg-secondary) px-3 py-2 no-underline transition-colors hover:bg-(--color-bg-tertiary) ${
                  isEnded ? "opacity-70" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-xs leading-tight text-(--color-text-tertiary)">
                    {m.ministry}
                  </span>
                  <span
                    className={`block truncate text-sm font-bold text-(--color-text-primary) ${
                      isEnded ? "line-through decoration-(--color-text-tertiary)" : ""
                    }`}
                  >
                    {m.name}
                  </span>
                </span>
                {badge ? (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      badge.tone === "warn"
                        ? "border border-(--color-status-absent) bg-(--color-bg-primary) text-(--color-status-absent)"
                        : "border border-(--color-status-present) bg-(--color-bg-primary) text-(--color-status-present)"
                    }`}
                  >
                    {badge.label}
                  </span>
                ) : (
                  m.memberId && (
                    <span className="shrink-0 rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 text-xs font-medium text-(--color-text-secondary)">
                      현역 의원
                    </span>
                  )
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
