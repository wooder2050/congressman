"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMember, getMemberHistory, getMemberTerms } from "@/lib/api";
import HistoryCharts from "./HistoryCharts";
import ColorBadge from "@/components/ui/color-badge";
import { formatPercent, formatDistrict } from "@/lib/utils";

interface HistoryInnerProps {
  id: string;
  termId: number;
}

export default function HistoryInner({ id, termId }: HistoryInnerProps) {
  const { data: member } = useCongressSuspenseQuery(getMember, id);
  const { data: activities } = useCongressSuspenseQuery(getMemberHistory, id);
  const { data: memberTerms } = useCongressSuspenseQuery(getMemberTerms, id);

  if (!member || activities.length === 0) return notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href={`/members/${id}?term=${termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 의원 상세
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{member.name}</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">역대 의정활동 비교</p>
      </div>

      {activities.length < 2 ? (
        <div className="rounded-lg bg-(--color-bg-secondary) p-6 text-center text-(--color-text-tertiary)">
          이전 임기 활동 기록이 없습니다.
        </div>
      ) : (
        <>
          <HistoryCharts activities={activities} />

          {/* 대수별 요약 카드 */}
          <section>
            <h3 className="mb-3 text-lg font-bold">대수별 요약</h3>
            <div className="space-y-3">
              {activities.map((activity) => {
                const mt = memberTerms.find((m) => m.termId === activity.termId);
                return (
                  <div
                    key={activity.termId}
                    className="rounded-xl border border-(--color-border-primary) p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg font-bold">{activity.termName}</span>
                      {mt && (
                        <ColorBadge label={mt.party.shortName} color={mt.party.color} size="sm" />
                      )}
                    </div>
                    {mt && (
                      <p className="mb-2 text-sm text-(--color-text-secondary)">
                        {mt.proportional ? "비례대표" : formatDistrict(mt.district)}
                      </p>
                    )}
                    <div className="grid grid-cols-3 divide-x divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary) text-center">
                      <div className="p-2">
                        <p className="text-lg font-bold">
                          {formatPercent(activity.attendanceRate)}
                        </p>
                        <p className="text-xs text-(--color-text-tertiary)">출석률</p>
                      </div>
                      <div className="p-2">
                        <p className="text-lg font-bold">{activity.billsProposed}건</p>
                        <p className="text-xs text-(--color-text-tertiary)">대표발의</p>
                      </div>
                      <div className="p-2">
                        <p className="text-lg font-bold">{activity.billsPassed}건</p>
                        <p className="text-xs text-(--color-text-tertiary)">가결</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
