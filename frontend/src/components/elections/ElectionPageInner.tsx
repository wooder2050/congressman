"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCongressQuery, useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getElection } from "@/lib/api";
import { getElectionTurnout } from "@/lib/turnout";
import type { ByElectionDetail, ElectionDistrictInfo } from "@/types";
import { proxyPhotoUrl } from "@/lib/photo";
import { isElectionMode } from "@/lib/local-election-result";
import ElectionHeader from "./ElectionHeader";
import EarlyVoteTurnoutBanner from "./EarlyVoteTurnoutBanner";
import LiveTurnoutBanner from "./LiveTurnoutBanner";
import ExitPollSection from "./ExitPollSection";
import ElectionTimeline from "./ElectionTimeline";
import VoteGuidePreview from "./VoteGuidePreview";
import DistrictSection from "./DistrictSection";
import RegistrationDeadlineBanner from "./RegistrationDeadlineBanner";
import ByElectionHotspots from "./ByElectionHotspots";

/** 지역별 정렬 순서 */
const REGION_ORDER = [
  "서울",
  "인천",
  "경기",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

function groupByRegion(districts: ElectionDistrictInfo[]) {
  const map = new Map<string, ElectionDistrictInfo[]>();
  for (const d of districts) {
    const region = d.region || "기타";
    if (!map.has(region)) map.set(region, []);
    map.get(region)!.push(d);
  }
  return [...map.entries()].sort(
    ([a], [b]) => (REGION_ORDER.indexOf(a) ?? 99) - (REGION_ORDER.indexOf(b) ?? 99),
  );
}

function getReasonIcon(reason: string): string {
  if (reason.includes("대통령") || reason.includes("비서실장")) return "\u{1F3DB}\uFE0F";
  if (reason.includes("당선무효")) return "\u2696\uFE0F";
  return "\u{1F4CB}";
}

export default function ElectionPageInner({ electionId }: { electionId: string }) {
  const { data: election } = useCongressSuspenseQuery<ByElectionDetail | null, string>(
    getElection,
    electionId,
  );
  // 본투표 실시간 투표율 — 재보궐은 지방선거와 동일 투표소 통합 집계라 local scope를 공유한다
  // (홈·지방선거 페이지와 동일 데이터 → local만 UPDATE하면 세 곳이 함께 갱신)
  const { data: liveTurnout } = useCongressQuery(getElectionTurnout, "local", {
    staleTime: 0,
    refetchInterval: 60_000,
  });
  const hasLiveTurnout = liveTurnout?.national != null;

  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  const regionGroups = useMemo(
    () => (election ? groupByRegion(election.districts) : []),
    [election],
  );

  if (!election) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-bold text-(--color-text-primary)">
          선거 정보를 찾을 수 없습니다
        </p>
      </div>
    );
  }

  const toggleRegion = (region: string) => {
    setExpandedRegion((prev) => (prev === region ? null : region));
    setSelectedDistrict(null);
  };

  const toggleDistrict = (id: number) => {
    setSelectedDistrict((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* 본투표 실시간 투표율 — 재보궐은 지방선거와 통합 집계라 local scope를 공유(홈·지방선거 페이지와 동일 데이터) */}
      {!isElectionMode(election.status) && (
        <LiveTurnoutBanner
          scope="local"
          scopeLabel="6·3 지방선거 동시 투표"
          badge="본투표 진행 중"
          asideLabel="오늘 06~18시"
        />
      )}

      {/* 사전투표율 요약 — 본투표율 노출 시 축소(compact), 개표 모드 진입 시 숨김 */}
      {!isElectionMode(election.status) && (
        <EarlyVoteTurnoutBanner
          compact={hasLiveTurnout}
          scopeLabel="6·3 재보궐선거 14곳"
          rate={24.12}
          comparison="재보선 14곳 평균 · 지방선거(23.51%)보다 소폭 높음"
          detail="유권자 226만7,121명 중 54만6,757명 참여 · 부산 북구갑 25.57% · 경기 평택을 18.39%"
        />
      )}

      {/* 재보궐 국회의원 출구조사 예측 — 18시 마감 직후 노출, 데이터 없으면 자동 숨김 */}
      <ExitPollSection scope="by-election" title="국회의원 재보궐 출구조사" initialCount={14} />

      <ElectionHeader election={election} />

      {/* 일정 타임라인 */}
      <ElectionTimeline />

      {/* 후보등록 마감 안내 배너 (5/14~15 전까지만 노출) */}
      <RegistrationDeadlineBanner />

      {/* 핫스팟 선거구 미리보기 — 여론조사 기반 정적 콘텐츠라 개표 후에는 숨김 */}
      {!isElectionMode(election.status) && <ByElectionHotspots />}

      {/* 요약 테이블 */}
      <section className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
        <div className="border-b border-(--color-border-primary) px-4 py-3 sm:px-5">
          <h2 className="text-base font-bold text-(--color-text-primary)">전체 선거구 현황</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border-primary) bg-(--color-bg-secondary) text-left text-xs font-semibold text-(--color-text-tertiary)">
                <th className="px-4 py-2.5 sm:px-5">지역</th>
                <th className="px-4 py-2.5 sm:px-5">선거구</th>
                <th className="hidden px-4 py-2.5 sm:table-cell sm:px-5">공석 사유</th>
                <th className="hidden px-4 py-2.5 md:table-cell md:px-5">전임</th>
                <th className="px-4 py-2.5 text-center sm:px-5">후보</th>
              </tr>
            </thead>
            <tbody>
              {election.districts.map((d) => {
                const prev = d.previousMember;
                const partyColor = prev?.party?.color ?? "#9ca3af";
                return (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-b border-(--color-border-primary) transition-colors last:border-b-0 hover:bg-(--color-bg-hover)"
                    onClick={() => {
                      setExpandedRegion(d.region || "기타");
                      setSelectedDistrict(d.id);
                      setTimeout(() => {
                        document.getElementById(`district-${d.id}`)?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }, 100);
                    }}
                  >
                    <td className="px-4 py-2.5 sm:px-5">
                      <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-xs font-medium text-(--color-text-secondary)">
                        {d.region}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-(--color-text-primary) sm:px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: partyColor }}
                          role="img"
                          aria-label={prev?.party?.name ?? "무소속"}
                        />
                        {d.district}
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 text-(--color-text-secondary) sm:table-cell sm:px-5">
                      {d.vacancyReason}
                    </td>
                    <td className="hidden px-4 py-2.5 md:table-cell md:px-5">
                      {prev && prev.name !== "공석" ? (
                        <div className="flex items-center gap-1.5">
                          {prev.photoUrl ? (
                            <Image
                              src={proxyPhotoUrl(prev.photoUrl)}
                              alt={prev.name}
                              width={20}
                              height={20}
                              unoptimized
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                              style={{ backgroundColor: partyColor }}
                            >
                              {prev.name.slice(0, 1)}
                            </div>
                          )}
                          <span className="text-sm text-(--color-text-secondary)">{prev.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-(--color-text-tertiary)">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center sm:px-5">
                      {d.candidates.length > 0 ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {d.candidates.length}명
                        </span>
                      ) : (
                        <span className="text-xs text-(--color-text-tertiary)">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 지역별 그룹 (접이식) */}
      <div className="space-y-3">
        {regionGroups.map(([region, districts]) => {
          const isExpanded = expandedRegion === region;
          const totalCandidates = districts.reduce((sum, d) => sum + d.candidates.length, 0);

          return (
            <section
              key={region}
              className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
            >
              {/* 지역 헤더 (토글) */}
              <button
                onClick={() => toggleRegion(region)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-(--color-bg-hover) sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-bg-tertiary) text-sm font-bold text-(--color-text-secondary)">
                    {region.slice(0, 1)}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-(--color-text-primary)">{region}</h3>
                    <p className="mt-0.5 text-xs text-(--color-text-tertiary)">
                      {districts.length}개 선거구
                      {totalCandidates > 0 && ` · 후보 ${totalCandidates}명`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* 선거구 미니 프리뷰 (접힌 상태) */}
                  {!isExpanded && (
                    <div className="hidden items-center gap-1 sm:flex">
                      {districts.map((d) => {
                        const color = d.previousMember?.party?.color ?? "#9ca3af";
                        return (
                          <span
                            key={d.id}
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                            title={`${d.district} (${d.previousMember?.party?.name ?? "무소속"})`}
                            role="img"
                            aria-label={`${d.district}: ${d.previousMember?.party?.name ?? "무소속"}`}
                          />
                        );
                      })}
                    </div>
                  )}
                  <span
                    className={`text-sm text-(--color-text-tertiary) transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </div>
              </button>

              {/* 펼쳐진 선거구 목록 */}
              {isExpanded && (
                <div className="border-t border-(--color-border-primary)">
                  {districts.map((d) => {
                    const isDistrictExpanded = selectedDistrict === d.id;
                    const prev = d.previousMember;
                    const partyColor = prev?.party?.color ?? "#9ca3af";

                    return (
                      <div
                        key={d.id}
                        id={`district-${d.id}`}
                        className="scroll-mt-20 border-b border-(--color-border-primary) last:border-b-0"
                      >
                        {/* 선거구 요약 행 */}
                        <button
                          onClick={() => toggleDistrict(d.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-(--color-bg-hover) sm:px-5"
                        >
                          <span
                            className="h-full w-1 shrink-0 self-stretch rounded-full"
                            style={{ backgroundColor: partyColor }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-(--color-text-primary)">
                                {d.district}
                              </span>
                              {!d.confirmed && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                  사퇴 예정
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-(--color-text-tertiary)">
                              <span>
                                {getReasonIcon(d.vacancyReason)} {d.vacancyReason}
                              </span>
                              {prev && prev.name !== "공석" && (
                                <span className="flex items-center gap-1">
                                  {prev.party && (
                                    <span
                                      className="inline-block h-2 w-2 rounded-full"
                                      style={{ backgroundColor: partyColor }}
                                      aria-hidden="true"
                                    />
                                  )}
                                  전임 {prev.name}
                                </span>
                              )}
                              {d.candidates.length > 0 && (
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  후보 {d.candidates.length}명
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`shrink-0 text-xs text-(--color-text-tertiary) transition-transform ${isDistrictExpanded ? "rotate-180" : ""}`}
                          >
                            ▼
                          </span>
                        </button>

                        {/* 선거구 상세 (펼쳐질 때) */}
                        {isDistrictExpanded && (
                          <div className="bg-(--color-bg-secondary) px-4 pb-4 sm:px-5">
                            <DistrictSection district={d} electionId={electionId} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* 국회의원 출신 후보 성적표 링크 */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
        <h2 className="text-lg font-bold">국회의원 출신 후보 성적표</h2>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          출마한 전·현직 국회의원의 출석률, 표결참여율, 법안 발의·가결, 재산을 비교하세요.
        </p>
        <Link
          href={`/elections/${electionId}/lawmaker-candidates`}
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-primary-hover)"
        >
          성적표 보기 →
        </Link>
      </section>

      {/* 지역별 선거 정보 */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
        <h2 className="text-lg font-bold">지역별 선거 정보</h2>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          17개 시도별 재보궐 선거구, 후보자, 투표 안내를 확인하세요.
        </p>
        <Link
          href={`/elections/${electionId}/regions`}
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-(--color-bg-tertiary) px-4 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-hover)"
        >
          지역 선택하기 →
        </Link>
      </section>

      {/* 투표 안내 프리뷰 */}
      <VoteGuidePreview electionId={electionId} />
    </div>
  );
}
