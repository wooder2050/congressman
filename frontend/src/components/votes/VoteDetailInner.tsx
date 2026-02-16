"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getVoteMemberVotes } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ColorBadge from "@/components/ui/color-badge";
import VoteResultBar from "./VoteResultBar";
import MemberAvatar from "@/components/members/MemberAvatar";
import { formatDate, formatDistrict } from "@/lib/utils";
import { VOTE_RESULT_MAP, MEMBER_VOTE_RESULT_MAP } from "@/lib/constants";
import type { MemberVoteResult } from "@/types";

interface VoteDetailInnerProps {
  id: string;
}

const resultFilters: { id: MemberVoteResult | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "yes", label: "찬성" },
  { id: "no", label: "반대" },
  { id: "abstain", label: "기권" },
  { id: "absent", label: "불참" },
];

export default function VoteDetailInner({ id }: VoteDetailInnerProps) {
  const { data } = useCongressSuspenseQuery(getVoteMemberVotes, id);
  const [selectedFilter, setSelectedFilter] = useState<MemberVoteResult | "all">("all");

  const filteredVotes = useMemo(() => {
    if (!data) return [];
    if (selectedFilter === "all") return data.memberVotes;
    return data.memberVotes.filter((mv) => mv.result === selectedFilter);
  }, [data, selectedFilter]);

  const partyGroups = useMemo(() => {
    if (!data) return [];
    const groupMap = new Map<
      string,
      { partyName: string; partyColor: string; total: number; yes: number; no: number; abstain: number; absent: number }
    >();

    for (const mv of data.memberVotes) {
      const key = mv.partyName;
      if (!groupMap.has(key)) {
        groupMap.set(key, { partyName: mv.partyName, partyColor: mv.partyColor, total: 0, yes: 0, no: 0, abstain: 0, absent: 0 });
      }
      const g = groupMap.get(key)!;
      g.total++;
      g[mv.result]++;
    }

    return Array.from(groupMap.values()).sort((a, b) => b.total - a.total);
  }, [data]);

  if (!data) return notFound();

  const { vote, memberVotes } = data;
  const resultInfo = VOTE_RESULT_MAP[vote.resultCode] ?? VOTE_RESULT_MAP.other;
  const absentCount = vote.memberTotal - vote.voteTotal;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href={`/votes?term=${vote.termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 표결 목록
      </Link>

      <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-(--color-text-primary) sm:text-2xl">
            {vote.billName}
          </h1>
          <ColorBadge label={resultInfo.label} color={resultInfo.color} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-tertiary)">
          <span>{formatDate(vote.procDate)}</span>
          {vote.committee && <span>{vote.committee}</span>}
          {vote.billNo && <span>의안번호 {vote.billNo}</span>}
        </div>

        <VoteResultBar
          yesCount={vote.yesCount}
          noCount={vote.noCount}
          abstainCount={vote.abstainCount}
          voteTotal={vote.voteTotal}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{vote.yesCount}</p>
            <p className="text-xs text-(--color-text-tertiary)">찬성</p>
          </div>
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{vote.noCount}</p>
            <p className="text-xs text-(--color-text-tertiary)">반대</p>
          </div>
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{vote.abstainCount}</p>
            <p className="text-xs text-(--color-text-tertiary)">기권</p>
          </div>
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-2xl font-bold text-gray-500">{absentCount}</p>
            <p className="text-xs text-(--color-text-tertiary)">불참</p>
          </div>
        </div>

        <Link
          href={`/bills/${vote.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary) no-underline hover:underline"
        >
          법안 상세 보기 →
        </Link>
      </div>

      {/* 정당별 투표 현황 */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">정당별 투표 현황</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {partyGroups.map((pg) => (
            <div
              key={pg.partyName}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: pg.partyColor }}
                />
                <span className="font-semibold text-(--color-text-primary)">{pg.partyName}</span>
                <span className="text-sm text-(--color-text-tertiary)">{pg.total}명</span>
              </div>
              <div className="mb-2 flex h-3 w-full overflow-hidden rounded-full bg-(--color-bg-tertiary)">
                {pg.total > 0 && (
                  <>
                    {pg.yes > 0 && (
                      <div className="bg-green-500" style={{ width: `${(pg.yes / pg.total) * 100}%` }} />
                    )}
                    {pg.no > 0 && (
                      <div className="bg-red-500" style={{ width: `${(pg.no / pg.total) * 100}%` }} />
                    )}
                    {pg.abstain > 0 && (
                      <div className="bg-yellow-500" style={{ width: `${(pg.abstain / pg.total) * 100}%` }} />
                    )}
                    {pg.absent > 0 && (
                      <div className="bg-gray-400" style={{ width: `${(pg.absent / pg.total) * 100}%` }} />
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-(--color-text-tertiary)">
                <span>
                  찬성 <strong className="text-green-600">{pg.yes}</strong>
                </span>
                <span>
                  반대 <strong className="text-red-600">{pg.no}</strong>
                </span>
                <span>
                  기권 <strong className="text-yellow-600">{pg.abstain}</strong>
                </span>
                <span>
                  불참 <strong className="text-gray-500">{pg.absent}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">의원별 투표 내역</h2>

        <div className="flex flex-wrap gap-2">
          {resultFilters.map((opt) => (
            <Button
              key={opt.id}
              variant={selectedFilter === opt.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(opt.id)}
              className="rounded-full px-4 text-sm font-semibold"
            >
              {opt.label}
              {opt.id !== "all" && (
                <span className="ml-1 opacity-60">
                  {memberVotes.filter((mv) => mv.result === opt.id).length}
                </span>
              )}
            </Button>
          ))}
        </div>

        <p className="text-sm text-(--color-text-tertiary)">{filteredVotes.length}명</p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVotes.map((mv) => {
            const memberResultInfo = MEMBER_VOTE_RESULT_MAP[mv.result];
            return (
              <Link
                key={mv.memberId}
                href={`/members/${mv.memberId}?term=${vote.termId}`}
                className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
              >
                <MemberAvatar
                  name={mv.memberName}
                  photoUrl={mv.photoUrl}
                  size={40}
                  bgColor={mv.partyColor}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-(--color-text-primary)">
                      {mv.memberName}
                    </span>
                    <span className="text-xs text-(--color-text-tertiary)">{mv.partyName}</span>
                  </div>
                  <p className="truncate text-xs text-(--color-text-tertiary)">
                    {formatDistrict(mv.district)}
                  </p>
                </div>
                <ColorBadge
                  label={memberResultInfo.label}
                  color={memberResultInfo.color}
                  size="sm"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
