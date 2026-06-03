"use client";

import Link from "next/link";
import { useCongressQuery, useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElection } from "@/lib/api";
import { getElectionTurnout } from "@/lib/turnout";
import type { LocalElectionType } from "@/types";
import { ELECTION_TYPES } from "@/constants/local-elections";
import { isElectionMode } from "@/lib/local-election-result";
import EarlyVoteTurnoutBanner from "@/components/elections/EarlyVoteTurnoutBanner";
import LiveTurnoutBanner from "@/components/elections/LiveTurnoutBanner";
import LocalElectionHeader from "./LocalElectionHeader";
import LocalGovernorHotspots from "./LocalGovernorHotspots";
import LocalRegistrationBanner from "./LocalRegistrationBanner";
import LocalResultSummary from "./LocalResultSummary";
import ExitPollSection from "@/components/elections/ExitPollSection";
import RegionGrid from "./RegionGrid";

const EARLY_VOTE_END = new Date(2026, 4, 30); // 5/30 사전투표 종료
const ELECTION_DAY = new Date(2026, 5, 3); // 6/3 본투표
const POLL_CLOSE = new Date(2026, 5, 3, 18, 0, 0); // 6/3 18시 본투표 마감 — 이후 개표 단계

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
  // 본투표 실시간 투표율 — 데이터가 있으면 사전투표 배너는 축소(compact)로 전환
  const { data: liveTurnout } = useCongressQuery(getElectionTurnout, "local", {
    staleTime: 0,
    refetchInterval: 60_000,
  });
  const voteInfo = getVoteInfo();

  if (!election) {
    return (
      <div className="py-12 text-center text-(--color-text-tertiary)">
        선거 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const resultMode = isElectionMode(election.status);
  const hasLiveTurnout = liveTurnout?.national != null;
  // 개표 단계 — NEC 당선인 status가 아직 active여도 6/3 18시 이후면 개표 종합으로 유도
  const showResultsHub = resultMode || new Date() >= POLL_CLOSE;

  return (
    <div className="space-y-8">
      {/* 본투표 실시간 투표율 — Supabase ElectionTurnout 직접 조회(데이터 있을 때만 노출, 개표 모드 진입 시 숨김) */}
      {!resultMode && <LiveTurnoutBanner scope="local" scopeLabel="6·3 지방선거" />}

      {/* 사전투표율 요약 — 본투표율 노출 시 축소(compact), 개표 모드 진입 시 숨김 */}
      {!resultMode && (
        <EarlyVoteTurnoutBanner
          compact={hasLiveTurnout}
          scopeLabel="6·3 지방선거"
          rate={23.51}
          comparison="역대 지방선거 최고치 (직전 20.62% 대비 +2.89%p)"
          detail="유권자 4,464만9,908명 중 1,049만8,411명 참여 · 사전투표 1천만 명 첫 돌파"
          regions={[
            { region: "전남", rate: 38.95 },
            { region: "전북", rate: 35.05 },
            { region: "광주", rate: 27.83 },
            { region: "서울", rate: 23.84 },
            { region: "부산", rate: 21.29 },
            { region: "경기", rate: 20.96 },
            { region: "대구", rate: 18.65 },
          ]}
        />
      )}

      <LocalElectionHeader election={election} />

      {/* 후보등록 마감 안내 배너 (5/14~15 전까지만 노출, 개표 모드에선 숨김) */}
      <LocalRegistrationBanner resultMode={resultMode} />

      {/* 출구조사 예측 — 18시 마감 직후 방송 3사 공동 출구조사(데이터 있을 때만 노출, 18시 전 자동 숨김) */}
      <ExitPollSection scope="governor" title="시도지사 출구조사" />
      <ExitPollSection scope="superintendent" title="교육감 출구조사" />

      {/* 개표 현황 종합 페이지 — 개표 단계(6/3 18시 이후)에 시도지사·기초단체장·재보궐을 한곳에 모은 페이지로 유도 */}
      {showResultsHub && (
        <Link
          href={`/local-elections/${year}/results`}
          className="flex items-center justify-between gap-3 rounded-xl border border-(--color-primary) bg-(--color-primary)/5 p-4 transition-colors hover:bg-(--color-primary)/10"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-bold text-(--color-text-primary)">개표 현황 종합</h3>
              <p className="text-sm text-(--color-text-secondary)">
                시도지사·기초단체장·재보궐 개표를 한곳에서 — 당선 유력 추정 포함
              </p>
            </div>
          </div>
          <span className="shrink-0 text-(--color-primary)">→</span>
        </Link>
      )}

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
