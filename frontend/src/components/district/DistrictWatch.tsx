"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useUserPreferences, useUpdatePreferences } from "@/hooks/useUserPreferences";
import { getMembers, getMemberScorecard, getBills, getMemberVotes } from "@/lib/api";
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
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const districtsBySido = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const m of localMembers) {
      const parts = m.term.district.split(" ");
      const sido = parts[0];
      const district = parts.slice(1).join(" ");
      if (!sido || !district) continue;
      if (!map.has(sido)) map.set(sido, []);
      const list = map.get(sido)!;
      if (!list.includes(district)) list.push(district);
    }
    for (const [, list] of map) list.sort();
    return map;
  }, [localMembers]);

  const districts = selectedSido ? (districtsBySido.get(selectedSido) ?? []) : [];

  const matchedMembers = useMemo(() => {
    if (!selectedSido || !selectedDistrict) return [];
    const fullDistrict = `${selectedSido} ${selectedDistrict}`;
    return localMembers.filter((m) => m.term.district === fullDistrict);
  }, [localMembers, selectedSido, selectedDistrict]);

  const handleConfirm = () => {
    if (selectedSido && selectedDistrict) {
      onSelect(`${selectedSido} ${selectedDistrict}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="mb-4 text-lg font-bold text-(--color-text-primary)">지역구 선택</h2>
        {membersLoading ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
            <div className="h-12 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={selectedSido}
                onValueChange={(value) => {
                  setSelectedSido(value);
                  setSelectedDistrict("");
                }}
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-3 text-sm">
                  <SelectValue placeholder="시/도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {SIDO_LIST.map((sido) => (
                    <SelectItem key={sido} value={sido}>
                      {sido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={!selectedSido}
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-3 text-sm">
                  <SelectValue placeholder="지역구 선택" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
  const { data: scorecard, isLoading: scorecardLoading } = useQuery({
    queryKey: ["memberScorecard", member.id, termId],
    queryFn: () => getMemberScorecard({ memberId: member.id, termId }),
  });

  const { data: billsData, isLoading: billsLoading } = useQuery({
    queryKey: ["memberBills", member.id, termId],
    queryFn: () => getBills({ memberId: member.id, termId, role: "representative", limit: 5 }),
  });

  const { data: votesData, isLoading: votesLoading } = useQuery({
    queryKey: ["memberVotes", member.id, termId],
    queryFn: () => getMemberVotes({ memberId: member.id, termId, limit: 5 }),
  });

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
        {scorecardLoading ? (
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
        {billsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-(--color-bg-tertiary)" />
            ))}
          </div>
        ) : billsData && billsData.bills.length > 0 ? (
          <div className="space-y-2">
            {billsData.bills.map((bill) => (
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
        {votesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-(--color-bg-tertiary)" />
            ))}
          </div>
        ) : votesData && votesData.votes.length > 0 ? (
          <div className="space-y-2">
            {votesData.votes.map((vote) => (
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
