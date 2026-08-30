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

  const memberCount = d.ministers.filter((m) => m.memberId).length;

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
        {d.announcedAtLabel} 지명 · 6개 부처 후보자 중 현역 의원 {memberCount}명 · 인사청문회는
        정기국회 초반 소관 상임위에서 열릴 예정입니다.
      </p>

      <ul className="grid grid-cols-2 gap-2 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 sm:grid-cols-3">
        {d.ministers.map((m) => (
          <li key={m.slug}>
            <Link
              href={`${d.path}#nominee-${m.slug}`}
              className="flex min-h-12 items-center justify-between gap-2 rounded-lg bg-(--color-bg-secondary) px-3 py-2 no-underline transition-colors hover:bg-(--color-bg-tertiary)"
            >
              <span className="min-w-0">
                <span className="block text-xs leading-tight text-(--color-text-tertiary)">
                  {m.ministry}
                </span>
                <span className="block truncate text-sm font-bold text-(--color-text-primary)">
                  {m.name}
                </span>
              </span>
              {m.memberId && (
                <span className="shrink-0 rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 text-xs font-medium text-(--color-text-secondary)">
                  현역 의원
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
