import type { RaceCallStatus } from "@/lib/local-election-result";

interface Props {
  status: RaceCallStatus;
  /** 개표율 (%) — "개표중 p%" 표기용 */
  countedRate?: number | null;
}

/**
 * race 개표 상태 뱃지.
 *
 * 공식 확정(won)과 추정 당선(leading)을 모두 "당선" 채워진 칩으로 표시한다.
 * (사용자 요청: 역전 불가면 '유력' 대신 '당선'으로 통합. 추정은
 *  getRaceCallStatus의 보수적 판정 — 개표율 50%+·무효표 포함 남은표·엄격 비교 — 으로 제한)
 *  - 당선(won·leading): 채워진 칩(텍스트 반전)
 *  - 개표 완료: 개표율 ≥99%이나 당선 단정 불가(다인선거구·비례) — 옅은 칩 "개표 완료"
 *  - 개표중: 옅은 칩 + 개표율 — 진행 상태
 *  - 개표 전(pending): 렌더 안 함
 */
export default function RaceCallBadge({ status, countedRate }: Props) {
  if (status === "pending") return null;

  if (status === "won" || status === "leading") {
    return (
      <span className="shrink-0 rounded bg-(--color-text-primary) px-1.5 py-0.5 text-[10px] font-bold text-(--color-bg-primary)">
        당선
      </span>
    );
  }

  // counting — 개표율이 사실상 100%면 "개표 완료"(다인선거구·비례는 당선자 단정 불가)
  const done = countedRate != null && countedRate >= 99;
  return (
    <span className="shrink-0 rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] font-medium text-(--color-text-tertiary) tabular-nums">
      {done ? "개표 완료" : countedRate != null ? `개표 ${countedRate.toFixed(0)}%` : "개표중"}
    </span>
  );
}
