"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getAttendance, getMemberVotes, getBills } from "@/lib/api";
import type { MemberTerm } from "@/types";
import MemberActivitySummaryView from "./MemberActivitySummaryView";

interface MemberActivitySummaryProps {
  memberId: string;
  memberName: string;
  memberTerm: MemberTerm;
}

/**
 * 활동 요약 — 클라이언트 쿼리 경로.
 * 22대(기본)는 페이지 서버 컴포넌트가 MemberActivitySummaryView를 직접 SSR하므로,
 * 이 컴포넌트는 과거 대수로 전환했을 때만 렌더링된다.
 */
export default function MemberActivitySummary({
  memberId,
  memberName,
  memberTerm,
}: MemberActivitySummaryProps) {
  const termId = memberTerm.termId;
  const { data: attendance } = useCongressSuspenseQuery(getAttendance, { memberId, termId });
  const { data: votesData } = useCongressSuspenseQuery(getMemberVotes, {
    memberId,
    termId,
    limit: 1,
  });
  const { data: billsData } = useCongressSuspenseQuery(getBills, {
    memberId,
    termId,
    role: "representative",
    limit: 1,
  });

  if (!attendance) return null;

  return (
    <MemberActivitySummaryView
      memberName={memberName}
      memberTerm={memberTerm}
      attendance={attendance}
      voteSummary={votesData.summary}
      billTotal={billsData.total}
    />
  );
}
