"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useUserPreferences, useUpdatePreferences } from "@/hooks/useUserPreferences";
import { getMembers, getDistrictReport } from "@/lib/api";
import { SIDO_LIST } from "@/lib/geo/district-mapping";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MemberAvatar from "@/components/members/MemberAvatar";
import { formatDate, formatPercent } from "@/lib/utils";
import type { MemberWithTerm } from "@/types";

interface DistrictWatchProps {
  termId: number;
}

export default function DistrictWatch({ termId }: DistrictWatchProps) {
  const { user } = useAuth();
  const { data: prefs } = useUserPreferences();
  const updatePrefs = useUpdatePreferences();

  const savedDistrict = prefs?.district ?? null;
  const [localDistrict, setLocalDistrict] = useState<string | null>(null);
  const activeDistrict = localDistrict ?? savedDistrict;

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["members", termId],
    queryFn: () => getMembers(termId),
  });

  const localMembers = useMemo(
    () => (members ?? []).filter((m) => !m.term.proportional),
    [members],
  );

  const matchedMembers = useMemo(() => {
    if (!activeDistrict) return [];
    return localMembers.filter((m) => m.term.district === activeDistrict);
  }, [localMembers, activeDistrict]);

  const handleDistrictSelect = useCallback(
    (district: string) => {
      setLocalDistrict(district);
      if (user) {
        updatePrefs.mutate({ district });
      }
    },
    [user, updatePrefs],
  );

  const handleReset = useCallback(() => {
    if (user) {
      updatePrefs.mutate({ district: null as unknown as string });
    }
    setLocalDistrict(null);
  }, [user, updatePrefs]);

  if (!activeDistrict) {
    return (
      <DistrictSelector
        localMembers={localMembers}
        membersLoading={membersLoading}
        onSelect={handleDistrictSelect}
        isLoggedIn={!!user}
      />
    );
  }

  if (matchedMembers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-8 text-center">
          <p className="text-sm text-(--color-text-tertiary)">해당 지역구 의원 정보가 없습니다.</p>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-(--color-primary) hover:underline"
          >
            지역구 변경
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {matchedMembers.map((member) => (
        <MemberReport key={member.id} member={member} termId={termId} />
      ))}
      <div className="text-center">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-(--color-border-primary) px-4 py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary)"
        >
          지역구 변경
        </button>
      </div>
    </div>
  );
}

/** 선거구명에서 구/군 부분 추출 (갑/을/병/정/무 접미사 제거) */
function extractGugun(district: string): string {
  return district.replace(/[갑을병정무]$/, "");
}

function DistrictSelector({
  localMembers,
  membersLoading,
  onSelect,
  isLoggedIn,
}: {
  localMembers: MemberWithTerm[];
  membersLoading: boolean;
  onSelect: (district: string) => void;
  isLoggedIn: boolean;
}) {
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedGugun, setSelectedGugun] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // 시도 → 구/군 → 선거구 3단 구조 생성
  const { gugunsBySido, districtsByGugun, districtsBySido } = useMemo(() => {
    const gugunMap = new Map<string, Set<string>>();
    const distByGugun = new Map<string, string[]>();
    const distBySido = new Map<string, string[]>();

    for (const m of localMembers) {
      const parts = m.term.district.split(" ");
      const sido = parts[0];
      const district = parts.slice(1).join(" ");
      if (!sido || !district) continue;

      // 시도별 선거구 (기존 유지)
      if (!distBySido.has(sido)) distBySido.set(sido, []);
      const sidoList = distBySido.get(sido)!;
      if (!sidoList.includes(district)) sidoList.push(district);

      // 구/군 추출
      const gugun = extractGugun(district);
      if (!gugunMap.has(sido)) gugunMap.set(sido, new Set());
      gugunMap.get(sido)!.add(gugun);

      const gugunKey = `${sido}:${gugun}`;
      if (!distByGugun.has(gugunKey)) distByGugun.set(gugunKey, []);
      const gugunList = distByGugun.get(gugunKey)!;
      if (!gugunList.includes(district)) gugunList.push(district);
    }

    const guguns = new Map<string, string[]>();
    for (const [sido, set] of gugunMap) {
      guguns.set(sido, [...set].sort());
    }
    for (const [, list] of distBySido) list.sort();
    for (const [, list] of distByGugun) list.sort();

    return { gugunsBySido: guguns, districtsByGugun: distByGugun, districtsBySido: distBySido };
  }, [localMembers]);

  const guguns = selectedSido ? (gugunsBySido.get(selectedSido) ?? []) : [];

  // 구/군이 1개면 자동 선택
  const effectiveGugun = selectedGugun || (guguns.length === 1 ? guguns[0] : "");

  const filteredDistricts = effectiveGugun
    ? (districtsByGugun.get(`${selectedSido}:${effectiveGugun}`) ?? [])
    : (districtsBySido.get(selectedSido) ?? []);

  // 선거구가 1개뿐이면 자동 선택
  const autoSelectedDistrict = filteredDistricts.length === 1 ? filteredDistricts[0] : null;
  const effectiveDistrict = selectedDistrict || (autoSelectedDistrict ?? "");

  const matchedMembers = (() => {
    if (!selectedSido || !effectiveDistrict) return [];
    const fullDistrict = `${selectedSido} ${effectiveDistrict}`;
    return localMembers.filter((m) => m.term.district === fullDistrict);
  })();

  const handleConfirm = () => {
    if (selectedSido && effectiveDistrict) {
      onSelect(`${selectedSido} ${effectiveDistrict}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="mb-2 text-lg font-bold text-(--color-text-primary)">내 지역구 찾기</h2>
        <p className="mb-4 text-sm text-(--color-text-tertiary)">
          시/도와 구/군을 선택하면 해당 선거구를 자동으로 찾아드립니다.
        </p>
        {membersLoading ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
            <div className="h-12 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* 1단: 시/도 */}
            <Select
              value={selectedSido}
              onValueChange={(value) => {
                setSelectedSido(value);
                setSelectedGugun("");
                setSelectedDistrict("");
              }}
            >
              <SelectTrigger className="h-12 w-full rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-3 text-sm">
                <SelectValue placeholder="시/도를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {SIDO_LIST.map((sido) => (
                  <SelectItem key={sido} value={sido}>
                    {sido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 2단: 구/군 */}
            {selectedSido && guguns.length > 1 && (
              <Select
                value={selectedGugun}
                onValueChange={(value) => {
                  setSelectedGugun(value);
                  setSelectedDistrict("");
                }}
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-3 text-sm">
                  <SelectValue placeholder="구/군을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {guguns.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* 3단: 선거구 (구/군에 여러 선거구가 있을 때만) */}
            {selectedSido && filteredDistricts.length > 1 && (
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="h-12 w-full rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-3 text-sm">
                  <SelectValue placeholder="선거구를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {matchedMembers.length > 0 && (
              <div className="space-y-2">
                {matchedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-3"
                  >
                    <MemberAvatar
                      name={m.name}
                      photoUrl={m.photoUrl}
                      size={48}
                      bgColor={m.term.party.color}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-(--color-text-primary)">
                          {m.name}
                        </span>
                        <span className="text-sm text-(--color-text-tertiary)">
                          {m.term.party.name}
                        </span>
                      </div>
                      <p className="text-sm text-(--color-text-tertiary)">{m.term.district}</p>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full rounded-xl bg-(--color-primary) py-3 text-sm font-semibold text-(--color-text-inverse) transition-colors hover:bg-(--color-primary-hover)"
                >
                  이 의원의 활동 리포트 보기
                </button>
              </div>
            )}

            {selectedSido && selectedDistrict && matchedMembers.length === 0 && (
              <p className="py-4 text-center text-sm text-(--color-text-tertiary)">
                해당 지역구 의원 정보가 없습니다.
              </p>
            )}
          </div>
        )}

        {!isLoggedIn && (
          <p className="mt-4 text-center text-xs text-(--color-text-tertiary)">
            로그인하면 설정이 저장됩니다
          </p>
        )}
      </div>
    </div>
  );
}

function MemberReport({ member, termId }: { member: MemberWithTerm; termId: number }) {
  const { data: report, isLoading } = useQuery({
    queryKey: ["districtReport", member.id, termId],
    queryFn: () => getDistrictReport({ memberId: member.id, termId }),
  });

  const scorecard = report?.scorecard ?? null;
  const bills = report?.recentBills ?? [];
  const votes = report?.recentVotes?.votes ?? [];

  return (
    <div className="space-y-4">
      {/* 프로필 카드 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <div className="flex items-center gap-4">
          <MemberAvatar
            name={member.name}
            photoUrl={member.photoUrl}
            size={64}
            bgColor={member.term.party.color}
          />
          <div>
            <h2 className="text-xl font-bold text-(--color-text-primary)">{member.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: member.term.party.color }}
              >
                {member.term.party.name}
              </span>
              <span className="text-sm text-(--color-text-tertiary)">{member.term.district}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 활동 통계 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h3 className="mb-4 text-lg font-bold text-(--color-text-primary)">활동 통계</h3>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-(--color-bg-tertiary)" />
            ))}
          </div>
        ) : scorecard ? (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="출석률"
              value={formatPercent(scorecard.attendance.rate)}
              sub={`${scorecard.attendance.rank}위 / ${scorecard.attendance.totalMembers}명`}
            />
            <StatCard
              label="표결 참여율"
              value={formatPercent(scorecard.voteParticipation.rate)}
              sub={`${scorecard.voteParticipation.rank}위 / ${scorecard.voteParticipation.totalMembers}명`}
            />
            <StatCard
              label="대표 발의"
              value={`${scorecard.billProposal.representativeCount}건`}
              sub={`${scorecard.billProposal.rank}위 / ${scorecard.billProposal.totalMembers}명`}
            />
            <StatCard
              label="법안 통과율"
              value={formatPercent(scorecard.billPassRate.rate)}
              sub={`가결 ${scorecard.billPassRate.passedCount} / 대표발의 ${scorecard.billPassRate.totalRepresentative}건`}
            />
          </div>
        ) : (
          <p className="text-sm text-(--color-text-tertiary)">활동 통계 데이터가 없습니다.</p>
        )}
      </div>

      {/* 최근 법안 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h3 className="mb-4 text-lg font-bold text-(--color-text-primary)">최근 대표 발의 법안</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-(--color-bg-tertiary)" />
            ))}
          </div>
        ) : bills.length > 0 ? (
          <div className="space-y-2">
            {bills.map((bill) => (
              <Link
                key={bill.id}
                href={`/bills/${bill.id}`}
                className="block rounded-lg bg-(--color-bg-secondary) p-3 no-underline transition-colors hover:bg-(--color-bg-tertiary)"
              >
                <p className="text-sm font-semibold text-(--color-text-primary)">{bill.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-(--color-text-tertiary)">
                  {bill.topic && (
                    <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-xs">
                      {bill.topic}
                    </span>
                  )}
                  <span className="ml-auto">{formatDate(bill.proposedDate)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-(--color-text-tertiary)">대표 발의 법안이 없습니다.</p>
        )}
      </div>

      {/* 최근 표결 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h3 className="mb-4 text-lg font-bold text-(--color-text-primary)">최근 표결 참여</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-(--color-bg-tertiary)" />
            ))}
          </div>
        ) : votes.length > 0 ? (
          <div className="space-y-2">
            {votes.map((vote) => (
              <Link
                key={vote.voteId}
                href={`/votes/${vote.voteId}`}
                className="block rounded-lg bg-(--color-bg-secondary) p-3 no-underline transition-colors hover:bg-(--color-bg-tertiary)"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-sm font-semibold text-(--color-text-primary)">
                    {vote.billName}
                  </p>
                  <MemberVoteBadge result={vote.memberResult} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-(--color-text-tertiary)">
                  <span>{vote.procResult}</span>
                  <span className="ml-auto">{formatDate(vote.procDate)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-(--color-text-tertiary)">표결 참여 기록이 없습니다.</p>
        )}
      </div>

      {/* 상세 페이지 링크 */}
      <div className="text-center">
        <Link
          href={`/members/${member.id}?term=${termId}`}
          className="inline-block rounded-xl border border-(--color-border-primary) px-6 py-3 text-sm font-semibold text-(--color-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
        >
          의원 상세 보기 →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg bg-(--color-bg-secondary) p-3">
      <p className="text-xs text-(--color-text-tertiary)">{label}</p>
      <p className="mt-1 text-lg font-bold text-(--color-text-primary)">{value}</p>
      <p className="mt-0.5 text-xs text-(--color-text-tertiary)">{sub}</p>
    </div>
  );
}

function MemberVoteBadge({ result }: { result: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    yes: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      label: "찬성",
    },
    no: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      label: "반대",
    },
    abstain: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-300",
      label: "기권",
    },
    absent: {
      bg: "bg-gray-100 dark:bg-gray-900/30",
      text: "text-gray-700 dark:text-gray-300",
      label: "불참",
    },
  };

  const c = config[result] ?? config.absent;

  return (
    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
