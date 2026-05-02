"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getRecentActivity } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface MemberRecentActivityCardProps {
  memberId: string;
  termId: number;
  days?: number;
}

export default function MemberRecentActivityCard({
  memberId,
  termId,
  days = 7,
}: MemberRecentActivityCardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["recentActivity", memberId, termId, days],
    queryFn: () => getRecentActivity({ memberId, termId, days }),
  });

  if (isError) return null;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <div className="mb-3 h-5 w-32 animate-pulse rounded bg-(--color-bg-tertiary)" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-(--color-bg-tertiary)" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasActivity = data.billsProposed > 0 || data.votesParticipated > 0 || data.votesMissed > 0;

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h3 className="mb-3 text-base font-bold text-(--color-text-primary)">최근 {days}일 활동</h3>

      {!hasActivity ? (
        <p className="text-sm text-(--color-text-tertiary)">최근 {days}일간 활동 기록이 없습니다</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
              <p className="text-xl font-bold text-(--color-text-primary)">{data.billsProposed}</p>
              <p className="text-xs text-(--color-text-tertiary)">대표발의</p>
            </div>
            <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
              <p className="text-xl font-bold text-(--color-text-primary)">
                {data.votesParticipated}
              </p>
              <p className="text-xs text-(--color-text-tertiary)">표결 참여</p>
            </div>
            <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
              <p className="text-xl font-bold text-(--color-text-primary)">{data.votesMissed}</p>
              <p className="text-xs text-(--color-text-tertiary)">불참</p>
            </div>
          </div>

          {data.recentBills.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-semibold text-(--color-text-secondary)">최근 발의 법안</p>
              {data.recentBills.map((bill) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="block rounded-lg bg-(--color-bg-secondary) px-3 py-2 text-sm text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-tertiary)"
                >
                  <span className="line-clamp-1">{bill.title}</span>
                  <span className="mt-0.5 block text-xs text-(--color-text-tertiary)">
                    {formatDate(bill.proposedDate)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
