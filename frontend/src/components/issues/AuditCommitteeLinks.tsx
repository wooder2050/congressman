import Link from "next/link";
import { AUDIT_2026, auditCommitteePath, isAuditCommitteePageReady } from "@/data/audit-2026";
import { formatAuditDate } from "@/lib/audit-format";

/**
 * 의원·위원회 페이지에서 해당 상임위의 2026 국정감사 페이지로 보내는 카드.
 * 상세 페이지가 열린 위원회만 보여 준다(없으면 아무것도 렌더하지 않음).
 */
export default function AuditCommitteeLinks({
  committees,
  heading = "2026 국정감사",
}: {
  committees: string[];
  heading?: string;
}) {
  const targets = AUDIT_2026.committees.filter(
    (c) => committees.includes(c.name) && isAuditCommitteePageReady(c),
  );
  if (targets.length === 0) return null;

  return (
    <aside className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-3">
      <p className="text-xs font-semibold text-(--color-text-tertiary)">{heading}</p>
      <ul className="mt-1 space-y-1">
        {targets.map((c) => (
          <li key={c.name} className="text-sm">
            <Link
              href={auditCommitteePath(c.name)}
              className="font-semibold text-(--color-primary) hover:underline"
            >
              {c.short} 국감 일정·증인·쟁점 →
            </Link>{" "}
            <span className="text-(--color-text-tertiary)">
              {c.days[0] ? `${formatAuditDate(c.days[0].date)}부터` : c.period}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
