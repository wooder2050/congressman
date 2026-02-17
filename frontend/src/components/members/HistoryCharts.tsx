"use client";

import BarChart from "@/components/charts/BarChart";
import MetricHint from "@/components/ui/metric-hint";
import { METRIC_DEFINITIONS } from "@/constants/metrics";
import type { TermActivity } from "@/types";

interface HistoryChartsProps {
  activities: TermActivity[];
}

export default function HistoryCharts({ activities }: HistoryChartsProps) {
  const attendanceData = activities.map((a) => ({
    term: a.termName,
    출석률: a.attendanceRate,
  }));

  const billsData = activities.map((a) => ({
    term: a.termName,
    발의: a.billsProposed,
    가결: a.billsPassed,
  }));

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-lg font-bold">
          출석률 비교
          <MetricHint text={METRIC_DEFINITIONS.attendanceRate} />
        </h3>
        <BarChart
          data={attendanceData}
          xKey="term"
          bars={[{ dataKey: "출석률", color: "var(--color-status-present)", label: "출석률 (%)" }]}
        />
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold">법안 발의 비교</h3>
        <BarChart
          data={billsData}
          xKey="term"
          bars={[
            { dataKey: "발의", color: "var(--color-primary)", label: "대표발의" },
            { dataKey: "가결", color: "#0F766E", label: "가결" },
          ]}
        />
      </section>
    </div>
  );
}
