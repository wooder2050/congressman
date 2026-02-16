"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getBill } from "@/lib/api";
import ColorBadge from "@/components/ui/color-badge";
import MemberAvatar from "@/components/members/MemberAvatar";
import { formatDate, formatDistrict } from "@/lib/utils";
import { BILL_STATUS_MAP } from "@/lib/constants";

interface BillDetailInnerProps {
  id: string;
}

export default function BillDetailInner({ id }: BillDetailInnerProps) {
  const { data: bill } = useCongressSuspenseQuery(getBill, id);

  if (!bill) return notFound();

  const statusInfo = BILL_STATUS_MAP[bill.status];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href={`/bills?term=${bill.termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 법안 목록
      </Link>

      <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-(--color-text-primary) sm:text-2xl">
            {bill.title}
          </h1>
          <ColorBadge label={statusInfo.label} color={statusInfo.color} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-tertiary)">
          <span className="font-semibold text-(--color-text-secondary)">
            {bill.proposerName} 외 {bill.coProposerCount}인
          </span>
          <span>{formatDate(bill.proposedDate)}</span>
          {bill.committee && <span>{bill.committee}</span>}
        </div>

        {(bill.status === "passed" || bill.status === "discarded") && (
          <Link
            href={`/votes/${bill.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary) no-underline hover:underline"
          >
            표결 결과 보기 →
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">발의자 ({bill.proposers.length}명)</h2>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {bill.proposers.map((proposer) => (
            <Link
              key={proposer.memberId}
              href={`/members/${proposer.memberId}?term=${bill.termId}`}
              className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
            >
              <MemberAvatar
                name={proposer.memberName}
                photoUrl={proposer.photoUrl}
                size={40}
                bgColor={proposer.partyColor}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-(--color-text-primary)">
                    {proposer.memberName}
                  </span>
                  <span className="text-xs text-(--color-text-tertiary)">{proposer.partyName}</span>
                </div>
                <p className="truncate text-xs text-(--color-text-tertiary)">{formatDistrict(proposer.district)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
