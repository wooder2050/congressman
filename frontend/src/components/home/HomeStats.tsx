"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getHomeStats } from "@/lib/api";
import MetricHint from "@/components/ui/metric-hint";
import { METRIC_DEFINITIONS } from "@/constants/metrics";

interface HomeStatsProps {
  termId: number;
}

const statCards = [
  {
    key: "memberCount" as const,
    label: "의원",
    unit: "명",
    href: "/members",
  },
  {
    key: "billCount" as const,
    label: "발의 법안",
    unit: "건",
    href: "/bills",
  },
  {
    key: "voteCount" as const,
    label: "본회의 표결",
    unit: "건",
    href: "/votes",
  },
  {
    key: "avgAttendanceRate" as const,
    label: "평균 출석률",
    unit: "%",
    href: "",
    hint: METRIC_DEFINITIONS.attendanceRate,
  },
];

export default function HomeStats({ termId }: HomeStatsProps) {
  const { data } = useCongressSuspenseQuery(getHomeStats, termId);

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statCards.map((card) => {
        const content = (
          <>
            <p className="text-2xl font-bold text-(--color-text-primary) tabular-nums">
              {data[card.key].toLocaleString()}
              <span className="ml-0.5 text-sm font-medium text-(--color-text-secondary)">
                {card.unit}
              </span>
            </p>
            <p className="mt-1 text-sm text-(--color-text-tertiary)">
              {card.label}
              {"hint" in card && card.hint && <MetricHint text={card.hint} />}
            </p>
          </>
        );

        return card.href ? (
          <Link
            key={card.key}
            href={`${card.href}?term=${termId}`}
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            {content}
          </Link>
        ) : (
          <div
            key={card.key}
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
