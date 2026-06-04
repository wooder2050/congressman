import Link from "next/link";
import type { LocalElectionCandidatePreview, LocalElectionRaceSummary } from "@/types";
import { getRaceCallStatus, sortByResult } from "@/lib/local-election-result";
import RaceCallBadge from "./RaceCallBadge";

interface Props {
  /** 선거 id (예: "local-2026") — 선거구 상세 링크 구성용 */
  electionId: string;
  /** 섹션 제목 (예: "시도지사 개표") */
  title: string;
  /** 선거구 목록 — topCandidates에 개표 결과(voteCount/voteRate/isWinner) 포함 */
  races: LocalElectionRaceSummary[];
}

function ResultRow({
  candidate: c,
  rank,
  maxVoteCount,
  leading,
}: {
  candidate: LocalElectionCandidatePreview;
  rank: number;
  maxVoteCount: number;
  leading: boolean;
}) {
  const partyColor = c.party?.color ?? "var(--color-text-tertiary)";
  const barPct = maxVoteCount > 0 ? ((c.voteCount ?? 0) / maxVoteCount) * 100 : 0;
  const emphasize = c.isWinner || leading;

  return (
    <li className={`py-2.5 ${emphasize ? "" : "opacity-90"}`}>
      <div className="flex items-baseline gap-2">
        <span className="w-3 shrink-0 text-xs font-semibold text-(--color-text-tertiary) tabular-nums">
          {rank}
        </span>
        <span
          className="size-2 shrink-0 translate-y-0.5 rounded-full"
          style={{ backgroundColor: partyColor }}
          aria-hidden="true"
        />
        <span
          className={`min-w-0 flex-1 truncate text-(--color-text-primary) ${
            emphasize ? "text-sm font-bold" : "text-sm font-medium"
          }`}
        >
          {c.name}
          <span className="ml-1.5 text-xs font-normal text-(--color-text-tertiary)">
            {c.party?.shortName ?? c.party?.name ?? "무소속"}
          </span>
        </span>
        {c.isWinner && (
          <span className="shrink-0 rounded bg-(--color-text-primary) px-1.5 py-0.5 text-[10px] font-bold text-(--color-bg-primary)">
            당선
          </span>
        )}
        <span
          className={`shrink-0 text-right text-(--color-text-primary) tabular-nums ${
            emphasize ? "text-base font-bold" : "text-sm font-semibold"
          }`}
        >
          {c.voteRate != null ? `${c.voteRate.toFixed(1)}%` : "—"}
        </span>
      </div>
      <div className="mt-1.5 ml-5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--color-bg-tertiary)">
          <div
            className="h-full rounded-full"
            style={{
              width: `${barPct}%`,
              backgroundColor: partyColor,
              opacity: emphasize ? 1 : 0.5,
            }}
            aria-hidden="true"
          />
        </div>
        <span className="shrink-0 text-xs text-(--color-text-tertiary) tabular-nums">
          {c.voteCount != null ? c.voteCount.toLocaleString() : "—"}
        </span>
      </div>
    </li>
  );
}

/**
 * 지방선거 유형별 개표 현황 — 개표가 시작된 선거구만 카드로 모아 후보별 득표를 막대로 표시.
 * 재보궐의 ByElectionResults와 같은 선거구 단위 카드 그리드 패턴을 지방선거
 * LocalElectionRaceSummary(topCandidates 포함)에 맞춘 것.
 * 카드 헤더에 race 개표 상태(당선/유력/개표중 p%)를 RaceCallBadge로 표시한다.
 * 득표가 들어온 선거구가 없으면 섹션 전체를 렌더하지 않는다(개표 전).
 */
export default function LocalRaceResults({ electionId, title, races }: Props) {
  const tallied = races
    .filter((r) => r.topCandidates.some((c) => c.voteCount != null))
    .map((r) => ({
      ...r,
      ordered: sortByResult(r.topCandidates),
      call: getRaceCallStatus(r, r.topCandidates),
    }));

  if (tallied.length === 0) return null;

  // race가 사실상 개표 완료인지 — 당선 확정/추정(won·leading) 또는 개표율 ≥99%.
  const isRaceDone = (r: (typeof tallied)[number]) =>
    r.call === "won" || r.call === "leading" || (r.countedRate != null && r.countedRate >= 99);
  // 모든 선거구가 완료면 헤더를 "개표 완료"로, 일부만이면 진행 dot 유지.
  const allDone = tallied.every(isRaceDone);
  const yearPath = electionId.replace(/^local-/, "");

  return (
    <section className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
      <div className="flex items-center justify-between border-b border-(--color-border-primary) px-4 py-3 sm:px-5">
        <h2 className="text-base font-bold text-(--color-text-primary)">{title}</h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-text-secondary)">
          <span
            className={`size-1.5 rounded-full ${allDone ? "bg-(--color-text-secondary)" : "animate-pulse bg-(--color-text-tertiary)"}`}
            aria-hidden="true"
          />
          {tallied.length}곳 {allDone ? "개표 완료" : "개표 진행"}
        </span>
      </div>
      <div className="grid gap-px bg-(--color-border-primary) sm:grid-cols-2">
        {tallied.map((r) => {
          const maxVoteCount = r.ordered[0]?.voteCount ?? 0;
          return (
            <Link
              key={r.id}
              href={`/local-elections/${yearPath}/races/${r.id}`}
              className="block bg-(--color-bg-primary) px-4 py-3.5 transition-colors hover:bg-(--color-bg-secondary) sm:px-5"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[11px] font-medium text-(--color-text-secondary)">
                  {r.sido}
                </span>
                <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-(--color-text-primary)">
                  {r.sigungu || r.displayName}
                </h3>
                <RaceCallBadge status={r.call} countedRate={r.countedRate} />
              </div>
              <ul className="divide-y divide-(--color-border-primary)">
                {r.ordered.map((c, i) => (
                  <ResultRow
                    key={c.id}
                    candidate={c}
                    rank={i + 1}
                    maxVoteCount={maxVoteCount}
                    leading={i === 0 && (r.call === "leading" || r.call === "won")}
                  />
                ))}
              </ul>
            </Link>
          );
        })}
      </div>
      <p className="border-t border-(--color-border-primary) px-4 py-2.5 text-xs text-(--color-text-tertiary) sm:px-5">
        ※ 선관위 개표 결과 기준입니다. 다인선거구·비례대표의 의석별 당선인은 NEC 당선인 정보가
        이관되는 대로 반영됩니다.
      </p>
    </section>
  );
}
