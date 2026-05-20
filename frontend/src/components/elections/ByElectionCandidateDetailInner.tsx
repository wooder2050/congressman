"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getElectionCandidate } from "@/lib/api";
import CandidateDetailBody from "./CandidateDetailBody";

interface Props {
  electionId: string;
  candidateId: number;
}

export default function ByElectionCandidateDetailInner({ electionId, candidateId }: Props) {
  const { data: candidate } = useCongressSuspenseQuery(getElectionCandidate, {
    id: electionId,
    candidateId,
  });

  if (!candidate) {
    return (
      <div className="py-12 text-center text-(--color-text-tertiary)">
        후보자 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const { district } = candidate;
  const raceHref = `/elections/${electionId}/races/${district.id}`;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs leading-relaxed text-(--color-text-tertiary)">
        <Link
          href={`/elections/${electionId}`}
          className="hover:text-(--color-primary) hover:underline"
        >
          6·3 재보궐선거
        </Link>
        <span aria-hidden="true" className="mx-1.5">
          ›
        </span>
        <Link href={raceHref} className="hover:text-(--color-primary) hover:underline">
          {district.region} {district.district}
        </Link>
        <span aria-hidden="true" className="mx-1.5">
          ›
        </span>
        <span className="text-(--color-text-secondary)">{candidate.name}</span>
      </nav>

      <CandidateDetailBody
        candidate={candidate}
        electionTypeLabel="재보궐"
        member={candidate.member}
      />

      {/* 선거구로 돌아가기 */}
      <section className="border-t border-(--color-border-primary) pt-4">
        <Link
          href={raceHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
        >
          ← {district.district} 후보 비교로 돌아가기
        </Link>
      </section>
    </div>
  );
}
