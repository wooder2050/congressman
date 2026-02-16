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

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    initialMemberIds.filter((id) => memberMap.has(id)).slice(0, MAX_MEMBERS),
  );

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedIds.length > 0) {
      params.set("members", selectedIds.join(","));
    } else {
      params.delete("members");
    }
    const newUrl = `/compare?${params.toString()}`;
    const currentUrl = `/compare?${searchParams.toString()}`;
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedIds, searchParams, router]);

  const selectedMembers = selectedIds
    .map((id) => memberMap.get(id))
    .filter((m): m is MemberWithTerm => !!m);

  const handleSelect = useCallback((member: MemberWithTerm) => {
    setSelectedIds((prev) => {
      if (prev.includes(member.id)) return prev;
      if (prev.length >= MAX_MEMBERS) return prev;
      return [...prev, member.id];
    });
  }, []);

  const handleRemove = useCallback((memberId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== memberId));
  }, []);

  return (
    <div className="space-y-5">
      <MemberSearch
        members={allMembers}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        maxMembers={MAX_MEMBERS}
      />

      {selectedMembers.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-(--color-text-tertiary)">
            비교할 의원을 검색하여 추가해주세요
          </p>
          <p className="mt-1 text-sm text-(--color-text-tertiary)">최대 {MAX_MEMBERS}명</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedMembers.map((m) => (
              <CompareCard key={m.id} member={m} onRemove={handleRemove} />
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
