"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getHomeStats } from "@/lib/api";
import VoteListItem from "@/components/votes/VoteListItem";
import BillListItem from "@/components/bills/BillListItem";

interface RecentActivityProps {
  termId: number;
}

export default function RecentActivity({ termId }: RecentActivityProps) {
  const { data } = useCongressSuspenseQuery(getHomeStats, termId);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 최근 표결 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-(--color-text-primary)">최근 표결</h3>
          <Link
            href={`/votes?term=${termId}`}
            className="text-sm font-semibold text-(--color-primary) no-underline"
          >
            전체 보기 →
          </Link>
        </div>
        <div className="space-y-3">
          {data.recentVotes.map((vote) => (
            <VoteListItem key={vote.id} vote={vote} />
          ))}
          {data.recentVotes.length === 0 && (
            <p className="py-4 text-center text-sm text-(--color-text-tertiary)">
              표결 데이터가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* 최근 법안 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-(--color-text-primary)">최근 발의 법안</h3>
          <Link
            href={`/bills?term=${termId}`}
            className="text-sm font-semibold text-(--color-primary) no-underline"
          >
            전체 보기 →
          </Link>
        </div>
        <div className="space-y-3">
          {data.recentBills.map((bill) => (
            <BillListItem key={bill.id} bill={bill} />
          ))}
          {data.recentBills.length === 0 && (
            <p className="py-4 text-center text-sm text-(--color-text-tertiary)">
              법안 데이터가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
