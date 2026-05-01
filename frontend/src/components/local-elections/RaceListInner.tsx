"use client";

import { useState, useTransition } from "react";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionRaces } from "@/lib/api";
import type { LocalElectionType } from "@/types";
import ElectionTypeSelector from "./ElectionTypeSelector";
import RaceCard from "./RaceCard";

interface Props {
  year: string;
  electionId: string;
  initialType?: LocalElectionType;
  sido?: string;
}

export default function RaceListInner({ year, electionId, initialType, sido }: Props) {
  const [selectedType, setSelectedType] = useState<LocalElectionType | null>(initialType ?? null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const { data } = useCongressSuspenseQuery(getLocalElectionRaces, {
    id: electionId,
    type: selectedType ?? undefined,
    sido,
    q: query || undefined,
    page,
    limit: 30,
  });

  const handleTypeChange = (type: LocalElectionType | null) => {
    setSelectedType(type);
    setPage(1);
  };

  const handleSearch = () => {
    startTransition(() => {
      setQuery(search);
      setPage(1);
    });
  };

  const totalPages = Math.ceil(data.total / 30);

  return (
    <div className="space-y-4">
      <ElectionTypeSelector selected={selectedType} onChange={handleTypeChange} />

      {/* 검색 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="선거구 또는 후보자 검색"
          className="flex-1 rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-tertiary) focus:border-(--color-primary) focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="shrink-0 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-primary-hover)"
        >
          검색
        </button>
        {query && (
          <button
            onClick={() => {
              setSearch("");
              startTransition(() => {
                setQuery("");
                setPage(1);
              });
            }}
            className="shrink-0 rounded-lg border border-(--color-border-primary) px-3 py-2 text-sm text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary)"
          >
            초기화
          </button>
        )}
      </div>

      {data.races.length === 0 ? (
        <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
          {query ? `"${query}"에 대한 검색 결과가 없습니다.` : "등록된 선거구가 없습니다."}
        </p>
      ) : (
        <>
          <p className="text-sm text-(--color-text-tertiary)">
            총 {data.total}개 선거구
            {query && (
              <span className="ml-1 text-(--color-primary)">&ldquo;{query}&rdquo; 검색 결과</span>
            )}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.races.map((race) => (
              <RaceCard key={race.id} race={race} year={year} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary) disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-sm text-(--color-text-tertiary)">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary) disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
