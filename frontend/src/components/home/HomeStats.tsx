"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getHomeStats } from "@/lib/api";

interface HomeStatsProps {
  termId: number;
}

const statCards = [
  { key: "memberCount" as const, label: "의원", unit: "명", color: "text-blue-600" },
  { key: "billCount" as const, label: "발의 법안", unit: "건", color: "text-emerald-600" },
  { key: "voteCount" as const, label: "본회의 표결", unit: "건", color: "text-purple-600" },
  { key: "avgAttendanceRate" as const, label: "평균 출석률", unit: "%", color: "text-amber-600" },
];

export default function HomeStats({ termId }: HomeStatsProps) {
  const { data } = useCongressSuspenseQuery(getHomeStats, termId);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center"
        >
          <p className={`text-2xl font-bold ${card.color}`}>
            {data[card.key].toLocaleString()}
            <span className="ml-0.5 text-sm font-medium">{card.unit}</span>
          </p>
          <p className="mt-1 text-sm text-(--color-text-tertiary)">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
