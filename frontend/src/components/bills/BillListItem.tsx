import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import { formatDate } from "@/lib/utils";
import { BILL_STATUS_MAP } from "@/lib/constants";
import type { Bill } from "@/types";

interface BillListItemProps {
  bill: Bill;
}

export default function BillListItem({ bill }: BillListItemProps) {
  const statusInfo = BILL_STATUS_MAP[bill.status];

  return (
    <Link
      href={`/bills/${bill.id}`}
      className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-base font-semibold text-(--color-text-primary)">
          {bill.title}
        </h3>
        <ColorBadge label={statusInfo.label} color={statusInfo.color} size="sm" />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-tertiary)">
        <span className="font-semibold text-(--color-text-secondary)">
          {bill.proposerName} 외 {bill.coProposerCount}인
        </span>
        <span>{formatDate(bill.proposedDate)}</span>
        {bill.committee && <span>{bill.committee}</span>}
      </div>
    </Link>
  );
}
