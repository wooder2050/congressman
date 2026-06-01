import Image from "next/image";
import type { LocalElectionCandidateDetail } from "@/types";

interface Props {
  candidate: LocalElectionCandidateDetail;
  /** 1부터 시작하는 득표 순위 */
  rank: number;
  /** 이 race 최다 득표수 — 바 너비 정규화 기준 */
  maxVoteCount: number;
}

/**
 * 개표 결과 전용 후보 행.
 * 순위 · 사진 · 이름/정당 · 정당색 득표율 바 · 득표수/율을 한 행에 압축한다.
 * 당선자는 좌측 정당색 액센트 바와 배경 틴트로 강조한다.
 */
export default function LocalResultCandidateRow({ candidate: c, rank, maxVoteCount }: Props) {
  const partyColor = c.party?.color ?? "#999";
  const hasVotes = c.voteCount != null;
  // 바 너비: 최다 득표 대비 비율(절대 격차가 한눈에). 데이터 없으면 0.
  const barPct = hasVotes && maxVoteCount > 0 ? (c.voteCount! / maxVoteCount) * 100 : 0;

  return (
    <li
      className={`relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 sm:gap-4 sm:px-4 ${
        c.isWinner
          ? "border-green-500/60 bg-green-50/60 dark:border-green-400/50 dark:bg-green-950/20"
          : "border-(--color-border-primary) bg-(--color-bg-primary)"
      }`}
    >
      {/* 좌측 정당색 액센트 바 */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: partyColor }}
      />

      {/* 순위 */}
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
          rank === 1
            ? "bg-(--color-text-primary) text-(--color-bg-primary)"
            : "bg-(--color-bg-tertiary) text-(--color-text-secondary)"
        }`}
        aria-label={`${rank}위`}
      >
        {rank}
      </span>

      {/* 사진 */}
      <div
        className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 sm:size-14"
        style={{ borderColor: partyColor }}
      >
        {c.photoUrl ? (
          <Image src={c.photoUrl} alt={c.name} fill className="object-cover" unoptimized />
        ) : (
          <div
            className="flex size-full items-center justify-center text-base font-bold text-white"
            style={{ backgroundColor: partyColor }}
          >
            {c.name.slice(0, 1)}
          </div>
        )}
      </div>

      {/* 본문: 이름/정당 + 득표율 바 */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {c.candidateNumber != null && (
            <span className="text-xs font-bold tabular-nums" style={{ color: partyColor }}>
              {c.candidateNumber}
            </span>
          )}
          <h3 className="truncate text-base font-bold text-(--color-text-primary)">{c.name}</h3>
          {c.isWinner && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-green-600 px-2 py-0.5 text-[11px] font-bold text-white">
              당선
            </span>
          )}
          <span className="text-xs text-(--color-text-tertiary)">{c.party?.name ?? "무소속"}</span>
        </div>

        {/* 득표율 바 */}
        <div className="mt-2 flex items-center gap-2.5">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-(--color-bg-tertiary)">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width]"
              style={{
                width: `${barPct}%`,
                backgroundColor: partyColor,
                opacity: c.isWinner ? 1 : 0.55,
              }}
              aria-hidden="true"
            />
          </div>
          {c.voteRate != null && (
            <span className="w-12 shrink-0 text-right text-sm font-bold text-(--color-text-primary) tabular-nums">
              {c.voteRate.toFixed(1)}%
            </span>
          )}
        </div>

        {c.voteCount != null && (
          <p className="mt-1 text-xs text-(--color-text-tertiary) tabular-nums">
            {c.voteCount.toLocaleString()}표
          </p>
        )}
      </div>
    </li>
  );
}
