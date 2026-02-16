import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import { formatDate } from "@/lib/utils";
import { BILL_STATUS_MAP } from "@/lib/constants";
import type { Bill } from "@/types";

interface BillsTabProps {
  bills: Bill[];
  total: number;
}

export default function BillsTab({ bills, total }: BillsTabProps) {
  if (bills.length === 0) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">발의 법안이 없습니다.</div>
    );
  }

  return (
    <div className="space-y-4 py-4" role="tabpanel">
      <p className="text-sm text-(--color-text-tertiary)">대표발의 {total}건</p>
      <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
        {bills.map((bill) => {
          const statusInfo = BILL_STATUS_MAP[bill.status];
          return (
            <Link
              key={bill.id}
              href={`/bills/${bill.id}`}
              className="block bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="line-clamp-2 text-base font-semibold">{bill.title}</h4>
                <ColorBadge label={statusInfo.label} color={statusInfo.color} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-xs text-(--color-text-tertiary)">
                <span>{formatDate(bill.proposedDate)}</span>
                {bill.committee && <span>{bill.committee}</span>}
                <span>외 {bill.coProposerCount}인</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
