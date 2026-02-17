"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getAttendanceRanking } from "@/lib/api";
import MemberAvatar from "@/components/members/MemberAvatar";
import type { AttendanceRankItem } from "@/types";

interface AttendanceRankingProps {
  termId: number;
}

function RankList({
  title,
  description,
  items,
  termId,
  ascending,
}: {
  title: string;
  description: string;
  items: AttendanceRankItem[];
  termId: number;
  ascending?: boolean;
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-(--color-text-primary)">{title}</h3>
      <p className="text-sm text-(--color-text-tertiary)">{description}</p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <Link
            key={item.memberId}
            href={`/members/${item.memberId}?term=${termId}`}
            className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            <span
              className={`w-6 text-center text-lg font-bold ${
                index === 0
                  ? ascending
                    ? "text-red-500"
                    : "text-amber-500"
                  : index === 1
                    ? ascending
                      ? "text-red-400"
                      : "text-gray-400"
                    : index === 2
                      ? ascending
                        ? "text-red-300"
                        : "text-amber-700"
                      : "text-(--color-text-tertiary)"
              }`}
            >
              {index + 1}
            </span>
            <MemberAvatar
              name={item.name}
              photoUrl={item.photoUrl}
              size={40}
              bgColor={item.party.color}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-(--color-text-primary)">{item.name}</span>
                <span className="text-xs text-(--color-text-tertiary)">{item.party.shortName}</span>
              </div>
              <div className="text-xs text-(--color-text-tertiary)">
                {item.attended}/{item.totalSessions}회 참여
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-lg font-bold ${ascending ? "text-red-500" : "text-(--color-primary)"}`}
              >
                {item.rate}
              </span>
              <span className="ml-0.5 text-xs text-(--color-text-tertiary)">%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AttendanceRanking({ termId }: AttendanceRankingProps) {
  const { data } = useCongressSuspenseQuery(getAttendanceRanking, termId);

  if (!data?.top?.length && !data?.bottom?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <RankList
        title="출석률 TOP 5"
        description="본회의 표결 참여율이 가장 높은 의원입니다"
        items={data.top}
        termId={termId}
      />
      <RankList
        title="출석률 하위 5"
        description="본회의 표결 참여율이 가장 낮은 의원입니다"
        items={data.bottom}
        termId={termId}
        ascending
      />
    </div>
  );
}
