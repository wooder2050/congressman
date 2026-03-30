"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getScorecardRanking } from "@/lib/api";
import MemberAvatar from "@/components/members/MemberAvatar";
import ColorBadge from "@/components/ui/color-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/ui/pagination";
import type { ScorecardGrade, ScorecardRankingItem } from "@/types";

const PAGE_SIZE = 30;

type SortKey = "totalScore" | "attendance" | "voteParticipation" | "billProposal" | "billPassRate";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "totalScore", label: "종합점수순" },
  { value: "attendance", label: "출석률순" },
  { value: "voteParticipation", label: "표결참여율순" },
  { value: "billProposal", label: "법안발의순" },
  { value: "billPassRate", label: "법안통과율순" },
];

const GRADE_OPTIONS: { value: ScorecardGrade | "all"; label: string; color: string }[] = [
  { value: "all", label: "전체", color: "" },
  { value: "S", label: "S", color: "text-amber-600 dark:text-amber-400" },
  { value: "A", label: "A", color: "text-blue-600 dark:text-blue-400" },
  { value: "B", label: "B", color: "text-green-600 dark:text-green-400" },
  { value: "C", label: "C", color: "text-orange-600 dark:text-orange-400" },
  { value: "D", label: "D", color: "text-red-600 dark:text-red-400" },
];

const GRADE_BG: Record<ScorecardGrade, string> = {
  S: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  A: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  B: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  C: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  D: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

function sortItems(items: ScorecardRankingItem[], sort: SortKey): ScorecardRankingItem[] {
  return [...items].sort((a, b) => {
    switch (sort) {
      case "totalScore":
        return b.totalScore - a.totalScore;
      case "attendance":
        return b.attendance.rate - a.attendance.rate;
      case "voteParticipation":
        return b.voteParticipation.rate - a.voteParticipation.rate;
      case "billProposal":
        return b.billProposal.representativeCount - a.billProposal.representativeCount;
      case "billPassRate":
        return b.billPassRate.rate - a.billPassRate.rate;
      default:
        return 0;
    }
  });
}

export default function ScorecardRankingClient() {
  const { data } = useCongressSuspenseQuery(getScorecardRanking, 22);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<ScorecardGrade | "all">("all");
  const [partyFilter, setPartyFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("totalScore");
  const [page, setPage] = useState(1);

  const parties = useMemo(() => {
    const set = new Set(data.rankings.map((r) => r.party.shortName));
    return [...set].sort((a, b) => a.localeCompare(b, "ko"));
  }, [data]);

  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (const r of data.rankings) counts[r.grade]++;
    return counts;
  }, [data]);

  const filtered = useMemo(() => {
    let list = data.rankings;
    if (gradeFilter !== "all") list = list.filter((r) => r.grade === gradeFilter);
    if (partyFilter !== "all") list = list.filter((r) => r.party.shortName === partyFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.includes(q));
    }
    return sortItems(list, sort);
  }, [data, gradeFilter, partyFilter, search, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = useCallback(() => {
    setSearch("");
    setGradeFilter("all");
    setPartyFilter("all");
    setSort("totalScore");
    setPage(1);
  }, []);

  return (
    <div className="space-y-5">
      {/* 등급별 요약 카드 */}
      <div className="grid grid-cols-5 gap-2">
        {(["S", "A", "B", "C", "D"] as ScorecardGrade[]).map((grade) => (
          <button
            key={grade}
            onClick={() => {
              setGradeFilter(gradeFilter === grade ? "all" : grade);
              setPage(1);
            }}
            className={`rounded-xl p-3 text-center transition-all ${
              gradeFilter === grade
                ? GRADE_BG[grade] + " ring-2 ring-current"
                : "bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary)"
            }`}
          >
            <div
              className={`text-2xl font-black ${GRADE_OPTIONS.find((g) => g.value === grade)?.color}`}
            >
              {grade}
            </div>
            <div className="mt-0.5 text-sm font-bold text-(--color-text-primary)">
              {gradeCounts[grade]}명
            </div>
            <div className="text-xs text-(--color-text-tertiary)">
              {((gradeCounts[grade] / data.rankings.length) * 100).toFixed(0)}%
            </div>
          </button>
        ))}
      </div>

      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="의원 이름 검색"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-40"
        />
        <Select
          value={partyFilter}
          onValueChange={(v) => {
            setPartyFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="정당" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 정당</SelectItem>
            {parties.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || gradeFilter !== "all" || partyFilter !== "all") && (
          <button
            onClick={resetFilters}
            className="text-xs text-(--color-text-tertiary) hover:underline"
          >
            초기화
          </button>
        )}
        <span className="ml-auto text-sm text-(--color-text-tertiary)">{filtered.length}명</span>
      </div>

      {/* 의원 리스트 */}
      <div className="space-y-2">
        {pageItems.map((item, idx) => {
          const rank = (page - 1) * PAGE_SIZE + idx + 1;
          return (
            <Link
              key={item.memberId}
              href={`/members/${item.memberId}?term=22&tab=scorecard`}
              className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
            >
              {/* 순위 */}
              <span className="w-8 text-center text-sm font-bold text-(--color-text-tertiary)">
                {rank}
              </span>

              {/* 아바타 */}
              <MemberAvatar
                name={item.name}
                photoUrl={item.photoUrl}
                size={40}
                bgColor={item.party.color}
              />

              {/* 이름/정당/지역구 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-(--color-text-primary)">{item.name}</span>
                  <ColorBadge label={item.party.shortName} color={item.party.color} size="sm" />
                </div>
                <div className="text-xs text-(--color-text-tertiary)">{item.district}</div>
              </div>

              {/* 항목별 점수 (데스크톱) */}
              <div className="hidden items-center gap-4 text-xs text-(--color-text-secondary) lg:flex">
                <span>출석 {item.attendance.score}</span>
                <span>표결 {item.voteParticipation.score}</span>
                <span>발의 {item.billProposal.score}</span>
                <span>통과 {item.billPassRate.score}</span>
              </div>

              {/* 등급 + 점수 */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-(--color-text-primary)">
                  {item.totalScore}
                  <span className="text-xs font-normal text-(--color-text-tertiary)">점</span>
                </span>
                <span
                  className={`inline-flex size-8 items-center justify-center rounded-lg text-sm font-black ${GRADE_BG[item.grade as ScorecardGrade]}`}
                >
                  {item.grade}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* 안내문 */}
      <p className="text-xs leading-relaxed text-(--color-text-tertiary)">
        출석률(30점) + 표결 참여율(25점) + 법안 발의(25점, 백분위) + 법안 통과율(20점, 백분위) 합산.
        등급: S(90+), A(80+), B(70+), C(60+), D(60미만). 열린국회정보 공공데이터 기반, 매일 자동
        갱신.
      </p>
    </div>
  );
}
