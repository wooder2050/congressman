"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElection } from "@/lib/api";
import type { LocalElectionType } from "@/types";
import { ELECTION_TYPES } from "@/constants/local-elections";
import LocalElectionHeader from "./LocalElectionHeader";
import RegionGrid from "./RegionGrid";

const TYPE_ROUTES: Record<LocalElectionType, string> = {
  governor: "governor",
  mayor: "mayor",
  "metro-council": "metro-council",
  "local-council": "local-council",
  superintendent: "superintendent",
};

export default function LocalElectionLanding({ year }: { year: string }) {
  const { data: election } = useCongressSuspenseQuery(getLocalElection, `local-${year}`);

  if (!election) {
    return (
      <div className="py-12 text-center text-(--color-text-tertiary)">
        선거 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <LocalElectionHeader election={election} />

      {/* 선거 유형별 카드 */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-(--color-text-primary)">선거 유형</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ELECTION_TYPES.map((t) => {
            const count = election.raceCounts[t.id] ?? 0;
            return (
              <Link
                key={t.id}
                href={`/local-elections/${year}/${TYPE_ROUTES[t.id]}`}
                className="flex flex-col items-center gap-1 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 transition-colors hover:border-(--color-primary) hover:bg-(--color-bg-secondary)"
              >
                <span className="text-sm font-medium text-(--color-text-secondary)">{t.label}</span>
                <span className="text-2xl font-bold text-(--color-text-primary)">{count}</span>
                <span className="text-xs text-(--color-text-tertiary)">개 선거구</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 지역별 현황 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-(--color-text-primary)">지역별 현황</h2>
          <Link
            href={`/local-elections/${year}/regions`}
            className="text-sm text-(--color-primary) hover:underline"
          >
            전체 보기
          </Link>
        </div>
        <RegionGrid regions={election.regionSummary} baseUrl={`/local-elections/${year}/regions`} />
      </section>

      {/* 투표 안내 + 재보궐선거 */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/local-elections/${year}/vote`}
          className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5 transition-colors hover:border-(--color-primary) hover:bg-(--color-bg-secondary)"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗳️</span>
            <div>
              <h3 className="font-bold text-(--color-text-primary)">투표 안내</h3>
              <p className="text-sm text-(--color-text-secondary)">
                사전투표 5/29~30 · 본투표 6/3 · 투표용지 최대 7장
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/elections/2026-06-03"
          className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5 transition-colors hover:border-(--color-primary) hover:bg-(--color-bg-secondary)"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h3 className="font-bold text-(--color-text-primary)">6·3 재보궐선거</h3>
              <p className="text-sm text-(--color-text-secondary)">
                국회의원 재보궐선거도 동시 실시
              </p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
