"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMembers } from "@/lib/api";
import MemberSearch from "./MemberSearch";
import CompareCard from "./CompareCard";
import CompareCharts from "./CompareCharts";
import type { MemberWithTerm } from "@/types";

const MAX_MEMBERS = 4;

interface CompareInnerProps {
  termId: number;
  initialMemberIds: string[];
}

export default function CompareInner({ termId, initialMemberIds }: CompareInnerProps) {
  const { data: allMembers } = useCongressSuspenseQuery(getMembers, termId);
  const router = useRouter();
  const searchParams = useSearchParams();

  const memberMap = useMemo(() => {
    const map = new Map<string, MemberWithTerm>();
    for (const m of allMembers) map.set(m.id, m);
    return map;
  }, [allMembers]);

  // raw selectedIds — 대수가 바뀌면 무효 ID가 포함될 수 있음
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    initialMemberIds.filter((id) => memberMap.has(id)).slice(0, MAX_MEMBERS),
  );

  // 항상 현재 대수에 유효한 ID만 사용 (파생 값)
  const validIds = useMemo(
    () => selectedIds.filter((id) => memberMap.has(id)),
    [selectedIds, memberMap],
  );

  // URL sync — validIds 기반으로 URL 갱신
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (validIds.length > 0) {
      params.set("members", validIds.join(","));
    } else {
      params.delete("members");
    }
    const newUrl = `/compare?${params.toString()}`;
    const currentUrl = `/compare?${searchParams.toString()}`;
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [validIds, searchParams, router]);

  const selectedMembers = validIds
    .map((id) => memberMap.get(id))
    .filter((m): m is MemberWithTerm => !!m);

  const handleSelect = useCallback(
    (member: MemberWithTerm) => {
      setSelectedIds((prev) => {
        const current = prev.filter((id) => memberMap.has(id));
        if (current.includes(member.id)) return prev;
        if (current.length >= MAX_MEMBERS) return prev;
        return [...current, member.id];
      });
    },
    [memberMap],
  );

  const handleRemove = useCallback((memberId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== memberId));
  }, []);

  return (
    <div className="space-y-5">
      <MemberSearch
        members={allMembers}
        selectedIds={validIds}
        onSelect={handleSelect}
        maxMembers={MAX_MEMBERS}
      />

      {selectedMembers.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-(--color-bg-tertiary)">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-(--color-text-tertiary)"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-(--color-text-secondary)">
            의원을 추가하여 비교하세요
          </p>
          <p className="mt-1 text-sm text-(--color-text-tertiary)">
            위 검색창에서 최대 {MAX_MEMBERS}명까지 선택할 수 있습니다.
          </p>
          <div className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm text-(--color-text-tertiary)">
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--color-bg-tertiary) text-xs font-bold">
                1
              </span>
              <span>의원 이름을 검색하세요</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--color-bg-tertiary) text-xs font-bold">
                2
              </span>
              <span>2명 이상 선택하면 비교 차트가 표시됩니다</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedMembers.map((m) => (
              <CompareCard key={m.id} member={m} termId={termId} onRemove={handleRemove} />
            ))}
          </div>

          {selectedMembers.length >= 2 && (
            <CompareCharts members={selectedMembers} termId={termId} />
          )}
        </>
      )}
    </div>
  );
}
