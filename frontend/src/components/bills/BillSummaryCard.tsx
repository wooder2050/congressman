"use client";

import DonutChart from "@/components/charts/DonutChart";
import { BILL_STATUS_MAP } from "@/lib/constants";
import type { BillSummary } from "@/types";

interface BillSummaryCardProps {
  summary: BillSummary;
}

export default function BillSummaryCard({ summary }: BillSummaryCardProps) {
  const chartData = [
    { name: "가결", value: summary.passed, color: BILL_STATUS_MAP.passed.color },
    { name: "계류", value: summary.pending, color: BILL_STATUS_MAP.pending.color },
    { name: "폐기", value: summary.discarded, color: BILL_STATUS_MAP.discarded.color },
    { name: "위원회 심사", value: summary.committee, color: BILL_STATUS_MAP.committee.color },
  ];

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <DonutChart data={chartData} centerLabel={String(summary.total)} size={120} />
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2 sm:w-auto">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-sm text-(--color-text-secondary) whitespace-nowrap">{d.name}</span>
              <span className="text-sm font-bold">{d.value.toLocaleString()}건</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
