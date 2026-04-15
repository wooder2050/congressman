"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getElection } from "@/lib/api";
import type { ByElectionDetail } from "@/types";
import ElectionHeader from "./ElectionHeader";
import DistrictSection from "./DistrictSection";

export default function ElectionPageInner({ electionId }: { electionId: string }) {
  const { data: election } = useCongressSuspenseQuery<ByElectionDetail | null, string>(
    getElection,
    electionId,
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

  return (
    <div className="space-y-6">
      <ElectionHeader election={election} />

      {/* 선거구 목차 */}
      <nav className="flex flex-wrap gap-2">
        {election.districts.map((d) => (
          <a
            key={d.id}
            href={`#district-${d.id}`}
            className="rounded-lg bg-(--color-bg-secondary) px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) no-underline transition-colors hover:bg-(--color-bg-tertiary) hover:text-(--color-text-primary)"
          >
            {d.district}
          </a>
        ))}
      </nav>

      {/* 선거구별 섹션 */}
      <div className="space-y-6">
        {election.districts.map((d) => (
          <DistrictSection key={d.id} district={d} />
        ))}
      </div>
    </div>
  );
}
