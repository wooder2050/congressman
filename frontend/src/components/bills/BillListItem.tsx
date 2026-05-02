import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { formatDate } from "@/lib/utils";
import { BILL_STATUS_MAP } from "@/lib/constants";
import type { Bill } from "@/types";

interface BillListItemProps {
  bill: Bill;
}

export default function BillListItem({ bill }: BillListItemProps) {
  const statusInfo = BILL_STATUS_MAP[bill.status];

  return (
    <div className="flex items-start gap-2 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 transition-colors hover:bg-(--color-bg-hover)">
      <Link href={`/bills/${bill.id}`} className="min-w-0 flex-1 no-underline">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-(--color-text-primary)">
            {bill.title}
          </h3>
          <ColorBadge
            label={statusInfo.label}
            color={statusInfo.color}
            textColor={statusInfo.textColor}
            size="sm"
            termHint={statusInfo.termKey}
          />
        </div>
        {bill.simpleSummary && (
          <p className="mt-1 line-clamp-1 text-sm text-(--color-text-secondary)">
            {bill.simpleSummary}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-tertiary)">
          <span className="font-semibold text-(--color-text-secondary)">
            {bill.proposerName} 외 {bill.coProposerCount}인
          </span>
          <span>{formatDate(bill.proposedDate)}</span>
          {bill.committee && <span>{bill.committee}</span>}
        </div>
      </Link>
      <BookmarkButton billId={bill.id} />
    </div>
  );
}
