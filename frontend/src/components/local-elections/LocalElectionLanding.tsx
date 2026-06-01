"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElection } from "@/lib/api";
import type { LocalElectionType } from "@/types";
import { ELECTION_TYPES } from "@/constants/local-elections";
import { isElectionMode } from "@/lib/local-election-result";
import LocalElectionHeader from "./LocalElectionHeader";
import LocalGovernorHotspots from "./LocalGovernorHotspots";
import LocalRegistrationBanner from "./LocalRegistrationBanner";
import LocalResultSummary from "./LocalResultSummary";
import RegionGrid from "./RegionGrid";

const EARLY_VOTE_END = new Date(2026, 4, 30); // 5/30 사전투표 종료
const ELECTION_DAY = new Date(2026, 5, 3); // 6/3 본투표

function getVoteInfo(): { stage: "before" | "early" | "after" | "day"; dDay: number } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dDay = Math.ceil((ELECTION_DAY.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const earlyStart = new Date(2026, 4, 29);
  if (now < earlyStart) return { stage: "before", dDay };
  if (now <= EARLY_VOTE_END) return { stage: "early", dDay };
  if (dDay > 0) return { stage: "after", dDay };
  return { stage: "day", dDay };
}

const TYPE_ROUTES: Record<LocalElectionType, string> = {
  governor: "governor",
  mayor: "mayor",
  "metro-council": "metro-council",
  "metro-proportional": "metro-proportional",
  "local-council": "local-council",
  "local-proportional": "local-proportional",
  superintendent: "superintendent",
};

export default function LocalElectionLanding({ year }: { year: string }) {
  const { data: election } = useCongressSuspenseQuery(getLocalElection, `local-${year}`);
  const voteInfo = getVoteInfo();

  if (!election) {
    return (
      <div className="py-12 text-center text-(--color-text-tertiary)">
        선거 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const resultMode = isElectionMode(election.status);

  return (
    <div className="space-y-8">
      <LocalElectionHeader election={election} />

      {/* 후보등록 마감 안내 배너 (5/14~15 전까지만 노출, 개표 모드에선 숨김) */}
      <LocalRegistrationBanner resultMode={resultMode} />

      {/* 개표 현황 — 개표 시작(status === "completed") 시 정당별 당선 수 요약을 최상단에 */}
      {resultMode && <LocalResultSummary electionId={election.id} />}

      {/* 광역단체장 격전지 — 여론조사 기반 정적 콘텐츠라 개표 후에는 숨김 */}
      {!resultMode && <LocalGovernorHotspots />}

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
              <h3 className="font-bold text-(--color-text-primary)">
                {resultMode ? "개표 현황" : "투표 안내"}
              </h3>
              <p className="text-sm text-(--color-text-secondary)">
                {resultMode
                  ? "6·3 지방선거 개표가 진행 중입니다 · 선거구별 당선 결과를 확인하세요"
                  : voteInfo.stage === "after"
                    ? `사전투표 23.51% 마감(역대 최고) · 본투표 D-${voteInfo.dDay}(6/3) · 투표용지 최대 7장`
                    : voteInfo.stage === "early"
                      ? "사전투표 진행 중(5/29~30, 06~18시) · 본투표 6/3 · 투표용지 최대 7장"
                      : voteInfo.stage === "day"
                        ? "오늘은 6·3 지방선거 본투표일 · 06~18시 · 투표용지 최대 7장"
                        : "사전투표 5/29~30 · 본투표 6/3 · 투표용지 최대 7장"}
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
