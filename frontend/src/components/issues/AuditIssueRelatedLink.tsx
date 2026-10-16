import TrackedLink from "@/components/analytics/TrackedLink";

interface Props {
  link: { label: string; href: string };
  /** 어느 화면의 쟁점 카드인지(허브·상임위) */
  component: string;
}

/**
 * 국감 쟁점 카드 아래의 관련 편집 페이지 링크. 예산 허브로 가는 링크는 audit_to_budget_click으로
 * 따로 집계한다(노출 대비 클릭률로 국감→예산 이동을 본다, 2026-10-16 codex 검토).
 */
export default function AuditIssueRelatedLink({ link, component }: Props) {
  const toBudget = link.href.startsWith("/issues/budget-2027");
  return (
    <TrackedLink
      href={link.href}
      eventName={toBudget ? "audit_to_budget_click" : "audit_related_click"}
      eventParams={{ component, target: link.href }}
      impressionParams={{ component: `${component}_related_link`, target: link.href }}
      className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-(--color-border-primary) px-3 text-sm font-semibold text-(--color-primary) no-underline hover:bg-(--color-bg-secondary)"
    >
      {link.label} →
    </TrackedLink>
  );
}
