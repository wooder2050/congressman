import type { RaceCallStatus } from "@/lib/local-election-result";

interface Props {
  status: RaceCallStatus;
  /** 개표율 (%) — "개표중 p%" 표기용 */
  countedRate?: number | null;
}

/**
 * race 개표 상태 뱃지.
 *
 * "당선"(won, 공식 확정)과 "유력"(leading, 잠정 추정)을 시각적으로 명확히 구분한다:
 *  - 당선: 채워진 칩(텍스트 반전) — 확정의 무게감
 *  - 유력: 테두리 칩 + "유력" 텍스트 — 추정임을 분명히
 *  - 개표중: 옅은 칩 + 개표율 — 진행 상태
 *  - 개표 전(pending): 렌더 안 함
 */
export default function RaceCallBadge({ status, countedRate }: Props) {
  if (status === "pending") return null;

  if (status === "won") {
    return (
      <span className="shrink-0 rounded bg-(--color-text-primary) px-1.5 py-0.5 text-[10px] font-bold text-(--color-bg-primary)">
        당선
      </span>
    );
  }

  if (status === "leading") {
    return (
      <span className="shrink-0 rounded border border-(--color-primary) px-1.5 py-0.5 text-[10px] font-bold text-(--color-primary)">
        유력
      </span>
    );
  }

  // counting
  return (
    <span className="shrink-0 rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] font-medium text-(--color-text-tertiary) tabular-nums">
      {countedRate != null ? `개표 ${countedRate.toFixed(0)}%` : "개표중"}
    </span>
  );
}
