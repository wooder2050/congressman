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
  const isAlternativeDiscard =
    bill.status === "discarded" && bill.committeeResultCode?.includes("대안반영");

  const statusInfo = isAlternativeDiscard
    ? {
        label: "대안반영",
        color: "#0D9488",
        textColor: "#FFFFFF",
        termKey: "alternative_discard" as const,
      }
    : BILL_STATUS_MAP[bill.status];

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
        {isAlternativeDiscard && (
          <p className="mb-1 text-xs text-teal-600 dark:text-teal-400">
            원안은 폐기되었으나 핵심 내용이 대안에 반영되었습니다
          </p>
        )}
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
