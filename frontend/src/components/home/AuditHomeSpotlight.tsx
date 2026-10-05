import TrackedLink from "@/components/analytics/TrackedLink";
import { AUDIT_2026, auditCommitteePath, isAuditCommitteePageReady } from "@/data/audit-2026";
import { auditStatus, expandAuditDate, formatAuditMd, kstDateKey } from "@/lib/audit-format";

/**
 * 홈 진입 카드 — 2026 국정감사 기간(국감 전·중)에만 보인다. 10/31(KST)부터는 렌더하지 않는다.
 * 속보 배너가 "무슨 일이 있었나"를 맡으므로 이 카드는 "어디서 일정을 찾나"만 맡는다.
 * 오늘(국감 전이면 첫 감사일) 감사하는 위원회 칩과 허브 CTA 두 개만 둔다(2026-10-05 codex UX 검토).
 */
export default function AuditHomeSpotlight() {
  const d = AUDIT_2026;
  const now = new Date();
  const today = kstDateKey(now);
  if (today > d.extendedEnd) return null;
  const beforeStart = today < d.start;
  const focusKey = beforeStart ? d.start : today;
  const status = auditStatus(now);
  const focusCommittees = d.committees.filter(
    (c) =>
      c.status !== "pending" && c.days.some((day) => expandAuditDate(day.date).includes(focusKey)),
  );

  return (
    <section
      aria-labelledby="audit-spotlight-title"
      className="space-y-3 rounded-xl border border-(--color-border-primary) p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="audit-spotlight-title" className="text-xl font-bold">
          2026 국정감사
        </h2>
        <span className="rounded-full bg-(--color-text-primary) px-2.5 py-0.5 text-xs font-semibold text-(--color-text-inverse)">
          {status.label}
        </span>
      </div>
      <p className="text-sm text-(--color-text-secondary)">
        10월 6일~30일 · 상임위원회 17곳 · 피감기관 846곳 — 위원회별 일정·피감기관·증인을 한곳에
        모았습니다.
      </p>
      {focusCommittees.length > 0 && (
        <div>
          <p className="text-sm font-semibold">
            {beforeStart ? "첫 감사일" : "오늘"} {formatAuditMd(focusKey.slice(5))} ·{" "}
            {focusCommittees.length}개 위원회
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {focusCommittees.map((c) => (
              <li key={c.name}>
                <TrackedLink
                  href={
                    isAuditCommitteePageReady(c) ? auditCommitteePath(c.name) : `${d.path}#today`
                  }
                  eventName="home_audit_click"
                  eventParams={{ component: "home_audit_spotlight", position: "committee_chip" }}
                  className="inline-flex min-h-10 items-center rounded-full border border-(--color-border-primary) px-3 text-sm font-medium text-(--color-text-primary) no-underline hover:bg-(--color-bg-secondary)"
                >
                  {c.short}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <TrackedLink
          href={`${d.path}#today`}
          eventName="home_audit_click"
          eventParams={{ component: "home_audit_spotlight", position: "today" }}
          impressionParams={{ component: "home_audit_spotlight" }}
          className="inline-flex min-h-11 items-center rounded-lg bg-(--color-text-primary) px-4 text-sm font-semibold text-(--color-text-inverse) no-underline"
        >
          {beforeStart ? "첫 감사일 일정 보기" : "오늘 일정 보기"}
        </TrackedLink>
        <TrackedLink
          href={`${d.path}#agency-search`}
          eventName="home_audit_click"
          eventParams={{ component: "home_audit_spotlight", position: "agency_search" }}
          className="inline-flex min-h-11 items-center rounded-lg border border-(--color-border-primary) px-4 text-sm font-semibold text-(--color-text-primary) no-underline"
        >
          기관명으로 감사일 찾기
        </TrackedLink>
      </div>
    </section>
  );
}
