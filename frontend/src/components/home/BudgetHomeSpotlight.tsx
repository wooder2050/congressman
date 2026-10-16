import TrackedLink from "@/components/analytics/TrackedLink";
import { AUDIT_2026 } from "@/data/audit-2026";
import { BUDGET_2027 } from "@/data/budget-2027";
import { kstDateKey } from "@/lib/audit-format";

/** 예산안 의결 기한(헌법 제54조) 다음 날부터는 내린다 — 이후 처리 결과는 속보·허브에서 다룬다 */
const LAST_DAY = "2026-12-02";

/**
 * 홈 진입 카드 — 국감 카드(AuditHomeSpotlight)가 10/30까지 쓰던 자리를 10/31(KST)부터 이어받는다.
 * 국감 이후 유입을 예산안 심사로 잇는 것이 목적이고(2026-10-16 codex 검토), 국감 결산은 보조 링크로 남긴다.
 */
export default function BudgetHomeSpotlight() {
  const today = kstDateKey(new Date());
  if (today <= AUDIT_2026.extendedEnd || today > LAST_DAY) return null;
  const b = BUDGET_2027;
  const current = b.steps.find((s) => s.status === "current");

  return (
    <section
      aria-labelledby="budget-spotlight-title"
      className="space-y-3 rounded-xl border border-(--color-border-primary) p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="budget-spotlight-title" className="text-xl font-bold">
          2027 예산안 국회 심사
        </h2>
        {current && (
          <span className="rounded-full bg-(--color-text-primary) px-2.5 py-0.5 text-xs font-semibold text-(--color-text-inverse)">
            {current.label}
          </span>
        )}
      </div>
      <p className="text-sm text-(--color-text-secondary)">
        정부안 총지출 {b.total2027}조 원 · 위원회 심사 기한 11월 30일 · 법정 의결 기한 12월 2일 —
        심사 절차와 주요 사업의 정부안·쟁점을 원문 기준으로 정리했습니다.
      </p>
      <div className="flex flex-wrap gap-2">
        <TrackedLink
          href={`${b.path}#steps`}
          eventName="home_budget_click"
          eventParams={{ component: "home_budget_spotlight", position: "steps" }}
          impressionParams={{ component: "home_budget_spotlight" }}
          className="inline-flex min-h-11 items-center rounded-lg bg-(--color-text-primary) px-4 text-sm font-semibold text-(--color-text-inverse) no-underline"
        >
          심사 일정·절차 보기
        </TrackedLink>
        <TrackedLink
          href={`${b.path}#projects`}
          eventName="home_budget_click"
          eventParams={{ component: "home_budget_spotlight", position: "projects" }}
          className="inline-flex min-h-11 items-center rounded-lg border border-(--color-border-primary) px-4 text-sm font-semibold text-(--color-text-primary) no-underline"
        >
          주요 사업 보기
        </TrackedLink>
        <TrackedLink
          href={AUDIT_2026.path}
          eventName="home_budget_click"
          eventParams={{ component: "home_budget_spotlight", position: "audit_archive" }}
          className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-(--color-text-secondary) underline underline-offset-2"
        >
          2026 국정감사 기록
        </TrackedLink>
      </div>
    </section>
  );
}
