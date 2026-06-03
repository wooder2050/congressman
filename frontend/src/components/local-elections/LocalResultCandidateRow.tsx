import Image from "next/image";
import type { LocalElectionCandidateDetail } from "@/types";

interface Props {
  candidate: LocalElectionCandidateDetail;
  /** 1부터 시작하는 득표 순위 */
  rank: number;
  /** 이 race 최다 득표수 — 바 너비 정규화 기준 */
  maxVoteCount: number;
  /**
   * 당선(확정 또는 보수적 추정) 여부 — 미전달 시 공식 확정(isWinner)으로 폴백.
   * 추정 당선은 상위에서 getRaceCallStatus로 판정해 전달한다.
   */
  won?: boolean;
}

/**
 * 개표 결과 행 (에디토리얼 톤).
 * 색은 정당색 득표율 바에만 쓰고, 당선 표시는 활자 굵기와 라벨로 처리한다.
 * 카드 박스 대신 상위에서 divide-y 구분선으로 묶는다.
 */
export default function LocalResultCandidateRow({ candidate: c, rank, maxVoteCount, won }: Props) {
  const partyColor = c.party?.color ?? "var(--color-text-tertiary)";
  const hasVotes = c.voteCount != null;
  const barPct = hasVotes && maxVoteCount > 0 ? (c.voteCount! / maxVoteCount) * 100 : 0;
  const isWon = won ?? c.isWinner;

  return (
    <li className={`py-3.5 ${isWon ? "" : "opacity-90"}`}>
      <div className="flex items-center gap-3">
        {/* 순위 — 활자만 */}
        <span className="w-4 shrink-0 text-sm font-semibold text-(--color-text-tertiary) tabular-nums">
          {rank}
        </span>

        {/* 사진 */}
        <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-(--color-bg-tertiary)">
          {c.photoUrl ? (
            <Image src={c.photoUrl} alt={c.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex size-full items-center justify-center text-xs font-semibold text-(--color-text-secondary)">
              {c.name.slice(0, 1)}
            </div>
          )}
        </div>

        {/* 이름 · 정당 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: partyColor }}
              aria-hidden="true"
            />
            <span
              className={`truncate text-(--color-text-primary) ${
                isWon ? "text-[15px] font-bold" : "text-sm font-medium"
              }`}
            >
              {c.name}
            </span>
            {isWon && (
              <span className="shrink-0 text-xs font-semibold text-(--color-text-secondary)">
                당선{!c.isWinner && " (잠정)"}
              </span>
            )}
          </div>
          <p className="truncate pl-3.5 text-xs text-(--color-text-tertiary)">
            {c.party?.name ?? "무소속"}
            {c.candidateNumber != null ? ` · 기호 ${c.candidateNumber}` : ""}
          </p>
        </div>

        {/* 득표율 · 득표수 — 우측 정렬 활자 */}
        <div className="shrink-0 text-right">
          <p
            className={`text-(--color-text-primary) tabular-nums ${
              isWon ? "text-base font-bold" : "text-sm font-semibold"
            }`}
          >
            {c.voteRate != null ? `${c.voteRate.toFixed(1)}%` : "—"}
          </p>
          {c.voteCount != null && (
            <p className="text-xs text-(--color-text-tertiary) tabular-nums">
              {c.voteCount.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* 득표율 바 — 사진 좌측 들여쓰기에 맞춰 정렬 */}
      <div className="mt-2 ml-7 h-1 overflow-hidden rounded-full bg-(--color-bg-tertiary)">
        <div
          className="h-full rounded-full"
          style={{
            width: `${barPct}%`,
            backgroundColor: partyColor,
            opacity: isWon ? 1 : 0.5,
          }}
          aria-hidden="true"
        />
      </div>
    </li>
  );
}
