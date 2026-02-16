"use client";

import { useState, useEffect, useRef } from "react";
import MemberCard from "./MemberCard";
import { SkeletonCard } from "@/components/skeletons/MemberListSkeleton";
import type { MemberWithTerm } from "@/types";

const PAGE_SIZE = 30;

interface MemberGridProps {
  members: MemberWithTerm[];
}

export default function MemberGrid({ members }: MemberGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef(members);
  membersRef.current = members;

  // 필터/검색으로 실제 목록이 바뀔 때만 리셋 (배열 참조가 아닌 내용 기반)
  const membersKey = members.map((m) => m.id).join(",");
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [membersKey]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => {
            const total = membersRef.current.length;
            if (prev >= total) return prev;
            return Math.min(prev + PAGE_SIZE, total);
          });
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [membersKey]);

  if (members.length === 0) {
    return (
      <div className="py-12 text-center text-(--color-text-tertiary)">
        <p className="text-lg">검색 결과가 없습니다.</p>
      </div>
    );
  }

  const visible = members.slice(0, visibleCount);
  const hasMore = visibleCount < members.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((member) => (
          <MemberCard key={`${member.id}-${member.term.termId}`} member={member} />
        ))}
      </div>
      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </>
  );
}
