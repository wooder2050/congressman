"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getLocalElectionCandidate } from "@/lib/api";
import { electionTypeLabel, sidoToShort } from "@/constants/local-elections";
import CandidateDetailBody from "@/components/elections/CandidateDetailBody";

interface Props {
  electionId: string;
  candidateId: number;
}

/** electionId "local-2026" → "2026" */
function parseYear(electionId: string): string {
  return electionId.replace(/^local-/, "");
}

export default function LocalCandidateDetailInner({ electionId, candidateId }: Props) {
  const { data: candidate } = useCongressSuspenseQuery(getLocalElectionCandidate, {
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

  const year = parseYear(electionId);
  const { race } = candidate;
  const sidoShort = sidoToShort(race.sido);
  const raceHref = `/local-elections/${year}/races/${race.id}`;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs leading-relaxed text-(--color-text-tertiary)">
        <Link
          href={`/local-elections/${year}`}
          className="hover:text-(--color-primary) hover:underline"
        >
          제9회 전국동시지방선거
        </Link>
        <span aria-hidden="true" className="mx-1.5">
          ›
        </span>
        <Link href={raceHref} className="hover:text-(--color-primary) hover:underline">
          {sidoShort} {race.displayName}
        </Link>
        <span aria-hidden="true" className="mx-1.5">
          ›
        </span>
        <span className="text-(--color-text-secondary)">{candidate.name}</span>
      </nav>

      <CandidateDetailBody
        candidate={candidate}
        electionTypeLabel={electionTypeLabel(race.electionType)}
        member={candidate.member}
      />

      {/* 선거구로 돌아가기 */}
      <section className="border-t border-(--color-border-primary) pt-4">
        <Link
          href={raceHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
        >
          ← {race.displayName} 후보자 전체 보기
        </Link>
      </section>
    </div>
  );
}
