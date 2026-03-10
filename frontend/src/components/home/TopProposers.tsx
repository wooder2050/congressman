"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getHomeStats } from "@/lib/api";
import MemberAvatar from "@/components/members/MemberAvatar";

interface TopProposersProps {
  termId: number;
}

export default function TopProposers({ termId }: TopProposersProps) {
  const { data } = useCongressSuspenseQuery(getHomeStats, termId);

  if (!data?.topProposers?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-(--color-text-primary)">최다 대표발의 의원</h3>
      <p className="text-sm text-(--color-text-tertiary)">대표발의 법안이 가장 많은 의원입니다</p>
      <div className="space-y-2">
        {data.topProposers.map((proposer, index) => (
          <Link
            key={proposer.memberId}
            href={`/members/${proposer.memberId}?term=${termId}`}
            className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            <span
              className={`w-6 text-center text-lg font-bold ${
                index === 0
                  ? "text-amber-500"
                  : index === 1
                    ? "text-gray-400"
                    : index === 2
                      ? "text-amber-700"
                      : "text-(--color-text-tertiary)"
              }`}
            >
              {index + 1}
            </span>
            <MemberAvatar
              name={proposer.name}
              photoUrl={proposer.photoUrl}
              size={40}
              bgColor={proposer.party.color}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-(--color-text-primary)">{proposer.name}</span>
                <span className="text-xs text-(--color-text-tertiary)">
                  {proposer.party.shortName}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-(--color-primary)">{proposer.billCount}</span>
              <span className="ml-0.5 text-xs text-(--color-text-tertiary)">건</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
