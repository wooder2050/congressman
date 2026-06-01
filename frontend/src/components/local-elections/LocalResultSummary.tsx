"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionStats } from "@/lib/api";
import { PARTIES } from "@/lib/constants";

interface Props {
  electionId: string;
}

interface PartyResult {
  partyId: string;
  name: string;
  color: string;
  count: number;
}

/**
 * 개표 현황 요약 — 정당별 당선 수를 막대로 표시한다.
 * election.status === "completed"일 때만 메인 랜딩에서 렌더한다.
 */
export default function LocalResultSummary({ electionId }: Props) {
  const { data: stats } = useCongressSuspenseQuery(getLocalElectionStats, electionId);

  if (!stats || stats.totalWinners === 0) return null;

  const results: PartyResult[] = Object.entries(stats.winnersByParty)
    .map(([partyId, count]) => {
      const meta = PARTIES[partyId];
      return {
        partyId,
        name: meta?.shortName ?? meta?.name ?? "무소속",
        color: meta?.color ?? "#999999",
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const max = Math.max(...results.map((r) => r.count), 1);

  return (
    <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">개표 현황</h2>
        <span className="text-sm text-(--color-text-secondary)">
          당선 확정 {stats.totalWinners.toLocaleString()}명
        </span>
      </div>
      <ul className="space-y-2.5">
        {results.map((r) => (
          <li key={r.partyId} className="flex items-center gap-3">
            <span className="w-20 shrink-0 truncate text-sm font-medium text-(--color-text-primary)">
              {r.name}
            </span>
            <div className="relative h-5 flex-1 overflow-hidden rounded bg-(--color-bg-tertiary)">
              <div
                className="absolute inset-y-0 left-0 rounded"
                style={{ width: `${(r.count / max) * 100}%`, backgroundColor: r.color }}
                aria-hidden="true"
              />
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-bold text-(--color-text-primary)">
              {r.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-(--color-text-tertiary)">
        ※ NEC 당선인 정보 이관 시점에 따라 집계가 순차 반영됩니다.
      </p>
    </section>
  );
}
