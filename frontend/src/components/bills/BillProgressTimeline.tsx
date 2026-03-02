"use client";

import { formatDate } from "@/lib/utils";
import type { BillProgress } from "@/types";

interface BillProgressTimelineProps {
  progress: BillProgress;
  proposedDate: string;
  status: string;
}

interface Stage {
  label: string;
  date: string | null;
  result: string | null;
  status: "completed" | "current" | "pending";
}

function getStages(progress: BillProgress, proposedDate: string, billStatus: string): Stage[] {
  const stages: Stage[] = [
    {
      label: "발의",
      date: proposedDate,
      result: null,
      status: "completed",
    },
    {
      label: "위원회 회부",
      date: progress.committeeDate,
      result: null,
      status: progress.committeeDate
        ? "completed"
        : progress.committeePresentDate || progress.committeeResult
          ? "completed"
          : "pending",
    },
    {
      label: "위원회 심사",
      date: progress.committeePresentDate ?? progress.committeeResultDate,
      result: progress.committeeResult,
      status: progress.committeeResult
        ? "completed"
        : progress.committeePresentDate
          ? "current"
          : "pending",
    },
    {
      label: "법사위",
      date: progress.lawPresentDate ?? progress.lawSubmitDate,
      result: progress.lawResult,
      status: progress.lawResult ? "completed" : progress.lawSubmitDate ? "current" : "pending",
    },
    {
      label: "본회의",
      date: progress.plenaryDate,
      result:
        billStatus === "passed"
          ? "가결"
          : billStatus === "discarded" && progress.plenaryDate
            ? "부결"
            : null,
      status: progress.plenaryDate ? "completed" : "pending",
    },
  ];

  // 폐기/대안반영폐기 처리: 위원회에서 결과 나왔으면 이후 단계는 표시하지 않음
  if (
    progress.committeeResult &&
    (progress.committeeResult.includes("폐기") || progress.committeeResult.includes("철회")) &&
    !progress.lawSubmitDate
  ) {
    stages[3].status = "pending";
    stages[4].status = "pending";
  }

  return stages;
}

export default function BillProgressTimeline({
  progress,
  proposedDate,
  status,
}: BillProgressTimelineProps) {
  const stages = getStages(progress, proposedDate, status);

  if (!progress) return null;

  return (
    <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="text-lg font-bold">심사 경과</h2>

      {/* 데스크톱: 가로 타임라인 */}
      <div className="hidden sm:block">
        <div className="flex items-start justify-between">
          {stages.map((stage, i) => (
            <div key={stage.label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className={`h-0.75 flex-1 ${
                      stage.status !== "pending"
                        ? "bg-(--color-primary)"
                        : "bg-(--color-border-primary)"
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    stage.status === "completed"
                      ? "border-(--color-primary) bg-(--color-primary) text-white"
                      : stage.status === "current"
                        ? "animate-pulse border-(--color-primary) bg-(--color-bg-primary) text-(--color-primary)"
                        : "border-(--color-border-secondary) bg-(--color-bg-secondary) text-(--color-text-tertiary)"
                  }`}
                >
                  {stage.status === "completed" ? "✓" : i + 1}
                </div>
                {i < stages.length - 1 && (
                  <div
                    className={`h-0.75 flex-1 ${
                      stages[i + 1].status !== "pending"
                        ? "bg-(--color-primary)"
                        : "bg-(--color-border-primary)"
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-center text-xs font-semibold ${
                  stage.status !== "pending"
                    ? "text-(--color-text-primary)"
                    : "text-(--color-text-tertiary)"
                }`}
              >
                {stage.label}
              </span>
              {stage.date && (
                <span className="mt-0.5 text-center text-[11px] text-(--color-text-tertiary)">
                  {formatDate(stage.date)}
                </span>
              )}
              {stage.result && (
                <span className="mt-0.5 rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 text-center text-[11px] font-medium text-(--color-text-secondary)">
                  {stage.result}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 모바일: 세로 타임라인 */}
      <div className="sm:hidden">
        <div className="relative ml-4 space-y-4 border-l-2 border-(--color-border-secondary) pl-6">
          {stages.map((stage, i) => (
            <div key={stage.label} className="relative">
              <div
                className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  stage.status === "completed"
                    ? "border-(--color-primary) bg-(--color-primary) text-white"
                    : stage.status === "current"
                      ? "animate-pulse border-(--color-primary) bg-(--color-bg-primary) text-(--color-primary)"
                      : "border-(--color-border-secondary) bg-(--color-bg-secondary) text-(--color-text-tertiary)"
                }`}
              >
                {stage.status === "completed" ? "✓" : i + 1}
              </div>
              <div>
                <span
                  className={`text-sm font-semibold ${
                    stage.status !== "pending"
                      ? "text-(--color-text-primary)"
                      : "text-(--color-text-tertiary)"
                  }`}
                >
                  {stage.label}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {stage.date && (
                    <span className="text-xs text-(--color-text-tertiary)">
                      {formatDate(stage.date)}
                    </span>
                  )}
                  {stage.result && (
                    <span className="rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 text-xs font-medium text-(--color-text-secondary)">
                      {stage.result}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
