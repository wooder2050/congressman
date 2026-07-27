import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import { getRelatedBills, type RelatedBill } from "@/lib/api";
import { BILL_STATUS_MAP } from "@/lib/constants";
import { billDisplayTitle } from "@/lib/bill-title";

const RELATION_LABEL: Record<RelatedBill["relation"], string> = {
  "same-law": "같은 법률",
  "same-proposer": "같은 의원 발의",
  "same-topic": "같은 분야",
};

/**
 * 법안 상세 하단의 관련 법안 섹션 (서버 컴포넌트).
 * 상세 페이지 ISR(2일)에 함께 구워지므로 런타임 추가 요청이 없다.
 */
export default async function RelatedBills({ billId }: { billId: string }) {
  let bills: RelatedBill[] = [];
  try {
    bills = await getRelatedBills(billId);
  } catch {
    // 추천 실패는 상세 페이지 렌더링을 막지 않는다
    return null;
  }
  if (!bills.length) return null;

  return (
    <section className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="text-lg font-bold text-(--color-text-primary)">관련 법안</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {bills.map((b) => {
          const statusInfo = BILL_STATUS_MAP[b.status as keyof typeof BILL_STATUS_MAP];
          return (
            <li key={b.id}>
              <Link
                href={`/bills/${b.id}`}
                className="block h-full space-y-1.5 rounded-lg border border-(--color-border-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 font-medium text-(--color-text-secondary)">
                    {RELATION_LABEL[b.relation]}
                  </span>
                  {statusInfo && (
                    <ColorBadge
                      label={statusInfo.label}
                      color={statusInfo.color}
                      textColor={statusInfo.textColor}
                      size="sm"
                    />
                  )}
                </div>
                <p className="line-clamp-2 text-sm font-semibold text-(--color-text-primary)">
                  {billDisplayTitle(b.title, b.simpleSummary, 50)}
                </p>
                {b.simpleSummary && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-(--color-text-tertiary)">
                    {b.simpleSummary}
                  </p>
                )}
                <p className="text-xs text-(--color-text-tertiary)">
                  {b.proposerName} · {b.proposedDate}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
