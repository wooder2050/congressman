"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import {
  getMember,
  getMemberTerms,
  getAttendance,
  getAbsenceDetails,
  getBills,
  getVoteSummary,
  getVotes,
} from "@/lib/api";
import MemberProfile from "./MemberProfile";
import MemberDetailClient from "./MemberDetailClient";

interface MemberDetailInnerProps {
  id: string;
  termId: number;
  defaultTab: string;
}

export default function MemberDetailInner({ id, termId, defaultTab }: MemberDetailInnerProps) {
  const { data: member } = useCongressSuspenseQuery(getMember, id);
  const { data: memberTerms } = useCongressSuspenseQuery(getMemberTerms, id);
  const { data: attendance } = useCongressSuspenseQuery(getAttendance, {
    memberId: id,
    termId,
  });
  const { data: absenceDetails } = useCongressSuspenseQuery(getAbsenceDetails, {
    memberId: id,
    termId,
  });
  const { data: billsResult } = useCongressSuspenseQuery(getBills, { memberId: id, termId });
  const { data: voteSummary } = useCongressSuspenseQuery(getVoteSummary, termId);
  const { data: votesResult } = useCongressSuspenseQuery(getVotes, { termId, limit: 5 });

  if (!member) return notFound();

  const currentMemberTerm = memberTerms.find((mt) => mt.termId === termId);
  if (!currentMemberTerm) return notFound();

  const allTermIds = memberTerms.map((mt) => mt.termId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/members?term=${termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 목록으로
      </Link>

      <MemberProfile member={member} memberTerm={currentMemberTerm} allTermIds={allTermIds} />

      <MemberDetailClient
        attendance={attendance}
        absenceDetails={absenceDetails}
        bills={billsResult.bills}
        voteSummary={voteSummary}
        recentVotes={votesResult.votes}
        termId={termId}
        defaultTab={defaultTab}
      />
    </div>
  );
}
