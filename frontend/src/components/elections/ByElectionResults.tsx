import type { ElectionCandidate, ElectionDistrictInfo } from "@/types";
import { getRaceCallStatus } from "@/lib/local-election-result";
import RaceCallBadge from "@/components/local-elections/RaceCallBadge";

interface Props {
  districts: ElectionDistrictInfo[];
}

/** 당선 우선 → 득표순 정렬 (원본 불변) */
function sortByResult(cands: ElectionCandidate[]): ElectionCandidate[] {
  return [...cands].sort((a, b) => {
    if (!!a.isWinner !== !!b.isWinner) return a.isWinner ? -1 : 1;
    return (b.voteCount ?? -1) - (a.voteCount ?? -1);
  });
}

function ResultRow({
  candidate: c,
  rank,
  maxVoteCount,
  leading,
}: {
  candidate: ElectionCandidate;
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
        {emphasize && (
          <span className="shrink-0 rounded bg-(--color-text-primary) px-1.5 py-0.5 text-[10px] font-bold text-(--color-bg-primary)">
            당선{!c.isWinner && " (잠정)"}
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
 * 재보궐 개표 현황 — 개표가 시작된 선거구만 카드로 모아 후보별 득표를 막대로 표시.
 * 좁은 테이블 셀에 욱여넣는 대신 선거구 단위 카드 그리드로 분리해 가독성을 확보한다.
 * 득표가 들어온 선거구가 없으면 섹션 전체를 렌더하지 않는다(개표 전).
 */
export default function ByElectionResults({ districts }: Props) {
  const tallied = districts
    .filter((d) => d.candidates.some((c) => c.voteCount != null))
    .map((d) => ({
      ...d,
      ordered: sortByResult(d.candidates),
      // 재보궐은 단일 당선(다수대표제) — electionType/seatCount 기본값으로 단수 취급
      call: getRaceCallStatus(
        { countedRate: d.countedRate, totalVotes: d.totalVotes },
        d.candidates.map((c) => ({ isWinner: !!c.isWinner, voteCount: c.voteCount ?? null })),
      ),
    }));

  if (tallied.length === 0) return null;

  const anyWinner = tallied.some((d) => d.call === "won" || d.call === "leading");

  return (
    <section className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
      <div className="flex items-center justify-between border-b border-(--color-border-primary) px-4 py-3 sm:px-5">
        <h2 className="text-base font-bold text-(--color-text-primary)">개표 현황</h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-text-secondary)">
          <span
            className={`size-1.5 rounded-full ${anyWinner ? "bg-(--color-text-secondary)" : "animate-pulse bg-(--color-text-tertiary)"}`}
            aria-hidden="true"
          />
          {tallied.length}곳 개표 진행
        </span>
      </div>
      <div className="grid gap-px bg-(--color-border-primary) sm:grid-cols-2">
        {tallied.map((d) => {
          const maxVoteCount = d.ordered[0]?.voteCount ?? 0;
          return (
            <div key={d.id} className="bg-(--color-bg-primary) px-4 py-3.5 sm:px-5">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[11px] font-medium text-(--color-text-secondary)">
                  {d.region}
                </span>
                <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-(--color-text-primary)">
                  {d.district}
                </h3>
                <RaceCallBadge status={d.call} countedRate={d.countedRate} />
              </div>
              <ul className="divide-y divide-(--color-border-primary)">
                {d.ordered.map((c, i) => (
                  <ResultRow
                    key={c.id}
                    candidate={c}
                    rank={i + 1}
                    maxVoteCount={maxVoteCount}
                    leading={i === 0 && (d.call === "leading" || d.call === "won")}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="border-t border-(--color-border-primary) px-4 py-2.5 text-xs text-(--color-text-tertiary) sm:px-5">
        ※ 선관위 개표진행상황 기준으로 갱신되며, 개표 중 표시되는 ‘당선’은 잠정 추정으로 최종 결과와
        다를 수 있습니다.
      </p>
    </section>
  );
}
