/**
 * 개각 후보자 진행 단계 표시 — 지명 → 인사청문회 → 경과보고서 → 임명.
 * 상태는 편집 데이터(cabinet-nominees.ts)에서 사람이 확인해 바꾼 값만 반영한다.
 *
 * - 사퇴·지명 철회는 종료 상태: 단계 전부를 비활성으로 내리고 종료 pill에 aria-current를 준다.
 * - 경과보고서 미채택은 종료가 아니다(임명은 가능): 단계 라벨만 "보고서 미채택"으로 바꾼다.
 */

type Status =
  | "nominated"
  | "hearing_scheduled"
  | "hearing_completed"
  | "report_adopted"
  | "report_not_adopted"
  | "appointed"
  | "withdrawn"
  | "nomination_withdrawn";

const STEPS: { key: string; label: string; matches: Status[] }[] = [
  { key: "nominated", label: "지명", matches: ["nominated"] },
  { key: "hearing", label: "인사청문회", matches: ["hearing_scheduled", "hearing_completed"] },
  { key: "report", label: "경과보고서", matches: ["report_adopted", "report_not_adopted"] },
  { key: "result", label: "임명", matches: ["appointed"] },
];

const ENDED_LABEL: Partial<Record<Status, string>> = {
  withdrawn: "후보자 사퇴",
  nomination_withdrawn: "지명 철회",
};

function stepIndex(status: Status): number {
  return STEPS.findIndex((s) => s.matches.includes(status));
}

interface Props {
  status: Status;
  /** compact: 카드 안에서 한 줄로 */
  compact?: boolean;
}

export default function CabinetStatusTimeline({ status, compact = false }: Props) {
  const endedLabel = ENDED_LABEL[status];
  const isEnded = !!endedLabel;
  const current = isEnded ? -1 : stepIndex(status);

  return (
    <ol
      className={`flex flex-wrap items-center ${compact ? "gap-1 text-xs" : "gap-2 text-xs sm:text-sm"}`}
      aria-label="진행 단계"
    >
      {STEPS.map((step, i) => {
        const done = !isEnded && i < current;
        const active = !isEnded && i === current;
        const label =
          status === "report_not_adopted" && step.key === "report" ? "보고서 미채택" : step.label;
        return (
          <li key={step.key} className="flex items-center gap-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${
                active
                  ? "border-(--color-text-primary) bg-(--color-text-primary) text-(--color-text-inverse)"
                  : done
                    ? "border-(--color-border-primary) bg-(--color-bg-tertiary) text-(--color-text-secondary)"
                    : "border-(--color-border-primary) text-(--color-text-tertiary)"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done && <span aria-hidden="true">✓</span>}
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`h-px ${compact ? "w-1.5" : "w-3 sm:w-5"} ${done ? "bg-(--color-text-tertiary)" : "bg-(--color-border-primary)"}`}
              />
            )}
          </li>
        );
      })}
      {isEnded && (
        <li
          aria-current="step"
          className="ml-1 rounded-full border border-(--color-text-secondary) bg-(--color-bg-tertiary) px-2 py-0.5 font-semibold text-(--color-text-primary)"
        >
          {endedLabel}
        </li>
      )}
    </ol>
  );
}
