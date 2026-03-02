"use client";

import Link from "next/link";
import Image from "next/image";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getCommitteeStats } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { CommitteeStats } from "@/types";

interface CommitteeListInnerProps {
  termId: number;
}

export default function CommitteeListInner({ termId }: CommitteeListInnerProps) {
  const { data: committees } = useCongressSuspenseQuery(getCommitteeStats, termId);

  if (!committees || committees.length === 0) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">위원회 데이터가 없습니다.</div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-(--color-text-tertiary)">총 {committees.length}개 상임위원회</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {committees.map((committee) => (
          <CommitteeCard key={committee.name} committee={committee} termId={termId} />
        ))}
      </div>
    </div>
  );
}

function CommitteeCard({ committee, termId }: { committee: CommitteeStats; termId: number }) {
  return (
    <Link
      href={`/bills?committee=${encodeURIComponent(committee.name)}&term=${termId}`}
      className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-shadow hover:shadow-md"
    >
      <h3 className="text-base font-bold text-(--color-text-primary)">{committee.name}</h3>

      {committee.chair && (
        <div className="mt-2 flex items-center gap-2">
          <Image
            src={committee.chair.photoUrl}
            alt={committee.chair.name}
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
          <span className="text-sm text-(--color-text-secondary)">
            위원장 <span className="font-semibold">{committee.chair.name}</span>
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: committee.chair.partyColor }}
          >
            {committee.chair.partyName}
          </span>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-(--color-text-primary)">
            {committee.billTotal.toLocaleString()}
          </p>
          <p className="text-xs text-(--color-text-tertiary)">접수 법안</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-600">
            {committee.billPassed.toLocaleString()}
          </p>
          <p className="text-xs text-(--color-text-tertiary)">통과</p>
        </div>
        <div>
          <p className="text-lg font-bold text-(--color-text-primary)">{committee.memberCount}</p>
          <p className="text-xs text-(--color-text-tertiary)">위원</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-(--color-text-tertiary)">통과율</span>
          <span className="font-semibold text-(--color-text-secondary)">{committee.passRate}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-(--color-bg-tertiary)">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${Math.min(committee.passRate, 100)}%` }}
          />
        </div>
      </div>

      {committee.nextSchedule && (
        <div className="mt-3 rounded-lg bg-(--color-bg-secondary) px-3 py-2">
          <p className="text-xs text-(--color-text-tertiary)">다음 일정</p>
          <p className="text-sm font-medium text-(--color-text-primary)">
            {formatDate(committee.nextSchedule.meetingDate)}
            {committee.nextSchedule.meetingTime && ` ${committee.nextSchedule.meetingTime}`}
          </p>
        </div>
      )}
    </Link>
  );
}
