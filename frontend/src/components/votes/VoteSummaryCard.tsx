"use client";

import DonutChart from "@/components/charts/DonutChart";
import { VOTE_RESULT_MAP } from "@/lib/constants";
import type { VoteSummary } from "@/types";

interface VoteSummaryCardProps {
  summary: VoteSummary;
}

export default function VoteSummaryCard({ summary }: VoteSummaryCardProps) {
  const chartData = [
    { name: "원안가결", value: summary.passed, color: VOTE_RESULT_MAP.passed.color },
    { name: "수정가결", value: summary.amended, color: VOTE_RESULT_MAP.amended.color },
    { name: "부결", value: summary.rejected, color: VOTE_RESULT_MAP.rejected.color },
    { name: "폐기", value: summary.discarded, color: VOTE_RESULT_MAP.discarded.color },
  ];

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      <div className="flex items-center gap-6">
        <DonutChart data={chartData} centerLabel={String(summary.total)} size={140} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-sm text-(--color-text-secondary)">{d.name}</span>
              <span className="text-sm font-bold">{d.value}건</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
