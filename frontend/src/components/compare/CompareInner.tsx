"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMembers } from "@/lib/api";
import MemberSearch from "./MemberSearch";
import ComparePanel from "./ComparePanel";
import CompareBattle from "./CompareBattle";
import type { MemberWithTerm } from "@/types";

const MAX_MEMBERS = 2;

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

  const validIds = useMemo(
    () => selectedIds.filter((id) => memberMap.has(id)),
    [selectedIds, memberMap],
  );

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

  const left = validIds[0] ? (memberMap.get(validIds[0]) ?? null) : null;
  const right = validIds[1] ? (memberMap.get(validIds[1]) ?? null) : null;

  const handleSelectLeft = useCallback(
    (member: MemberWithTerm) => {
      setSelectedIds((prev) => {
        const r = prev[1] && memberMap.has(prev[1]) ? prev[1] : undefined;
        if (member.id === r) return prev;
        return r ? [member.id, r] : [member.id];
      });
    },
    [memberMap],
  );

  const handleSelectRight = useCallback(
    (member: MemberWithTerm) => {
      setSelectedIds((prev) => {
        const l = prev[0] && memberMap.has(prev[0]) ? prev[0] : undefined;
        if (member.id === l) return prev;
        return l ? [l, member.id] : [member.id];
      });
    },
    [memberMap],
  );

  const handleRemoveLeft = useCallback(() => {
    setSelectedIds((prev) => (prev[1] ? [prev[1]] : []));
  }, []);

  const handleRemoveRight = useCallback(() => {
    setSelectedIds((prev) => (prev[0] ? [prev[0]] : []));
  }, []);

  const excludeLeft = right ? [right.id] : [];
  const excludeRight = left ? [left.id] : [];

  return (
    <div className="space-y-4">
      {/* 검색창 — 모바일에서도 넉넉한 너비 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <MemberSearch
          members={allMembers}
          selectedIds={excludeLeft}
          onSelect={handleSelectLeft}
          maxMembers={999}
          disabled={false}
          placeholder={left ? "의원 변경" : "의원 검색"}
        />
        <MemberSearch
          members={allMembers}
          selectedIds={excludeRight}
          onSelect={handleSelectRight}
          maxMembers={999}
          disabled={false}
          placeholder={right ? "의원 변경" : "의원 검색"}
        />
      </div>

      {/* 1:1 패널 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-1 sm:gap-3">
        <ComparePanel member={left} termId={termId} side="left" onRemove={handleRemoveLeft} />

        <div className="flex items-center">
          <div className="flex size-9 items-center justify-center rounded-full bg-(--color-bg-tertiary) sm:size-12">
            <span className="text-xs font-black text-(--color-text-tertiary) sm:text-base">VS</span>
          </div>
        </div>

        <ComparePanel member={right} termId={termId} side="right" onRemove={handleRemoveRight} />
      </div>

      {/* 대결 차트 */}
      {left && right && <CompareBattle left={left} right={right} termId={termId} />}
    </div>
  );
}
