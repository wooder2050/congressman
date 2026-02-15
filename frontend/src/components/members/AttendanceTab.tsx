"use client";

import DonutChart from "@/components/charts/DonutChart";
import { formatPercent } from "@/lib/utils";
import type { AttendanceRecord, AbsenceDetail } from "@/types";

interface AttendanceTabProps {
  attendance: AttendanceRecord | null;
  absenceDetails: AbsenceDetail[];
}

export default function AttendanceTab({ attendance, absenceDetails }: AttendanceTabProps) {
  if (!attendance) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">출석 데이터가 없습니다.</div>
    );
  }

  const chartData = [
    { name: "출석", value: attendance.attended, color: "var(--color-status-present)" },
    {
      name: "결석",
      value: attendance.absent + attendance.leave + attendance.travel,
      color: "var(--color-status-absent)",
    },
  ];

  return (
    <div className="space-y-6 py-4" role="tabpanel">
      {/* 출석률 큰 숫자 + 도넛 */}
      <div className="flex items-center gap-6">
        <DonutChart data={chartData} centerLabel={formatPercent(attendance.rate)} />
        <div>
          <p
            className="text-3xl font-bold"
            style={{
              color:
                attendance.rate >= 90
                  ? "var(--color-status-present)"
                  : attendance.rate >= 80
                    ? "var(--color-status-pending)"
                    : "var(--color-status-absent)",
            }}
          >
            {formatPercent(attendance.rate)}
          </p>
          <p className="text-sm text-(--color-text-tertiary)">출석률</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "전체 회의", value: attendance.totalSessions },
          { label: "출석", value: attendance.attended },
          { label: "결석", value: attendance.absent },
          { label: "청가/출장", value: attendance.leave + attendance.travel },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs text-(--color-text-tertiary)">{item.label}</p>
          </div>
        ))}
      </div>

      {/* 결석 유형 */}
      {absenceDetails.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-(--color-text-tertiary)">결석 유형별</h3>
          <div className="space-y-2">
            {absenceDetails.map((detail) => (
              <div
                key={detail.type}
                className="flex items-center justify-between rounded-lg bg-(--color-bg-secondary) px-4 py-3"
              >
                <span className="text-base">{detail.type}</span>
                <span className="text-lg font-bold">{detail.count}회</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
