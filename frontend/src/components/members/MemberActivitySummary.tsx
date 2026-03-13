"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getAttendance, getMemberVotes, getBills } from "@/lib/api";
import { formatPercent } from "@/lib/utils";
import type { MemberTerm } from "@/types";

interface MemberActivitySummaryProps {
  memberId: string;
  memberName: string;
  memberTerm: MemberTerm;
}

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

  const voteSummary = votesData.summary;
  const billTotal = billsData.total;
  const voteParticipationRate =
    voteSummary.total > 0
      ? ((voteSummary.total - voteSummary.absent) / voteSummary.total) * 100
      : 0;

  const attendanceLevel =
    attendance.rate >= 95
      ? "매우 높은"
      : attendance.rate >= 90
        ? "높은"
        : attendance.rate >= 80
          ? "보통 수준의"
          : "낮은";

  const voteLevel =
    voteParticipationRate >= 95
      ? "매우 적극적으로"
      : voteParticipationRate >= 90
        ? "적극적으로"
        : voteParticipationRate >= 80
          ? "보통 수준으로"
          : "소극적으로";

  const billLevel =
    billTotal >= 50
      ? "활발한"
      : billTotal >= 20
        ? "보통 수준의"
        : billTotal >= 10
          ? "다소 적은"
          : "적은";

  const district = memberTerm.proportional ? "비례대표" : memberTerm.district || "";

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="mb-3 text-base font-bold text-(--color-text-primary)">
        제{termId}대 국회 활동 요약
      </h2>
      <p className="text-sm leading-relaxed text-(--color-text-secondary)">
        {memberName} {memberTerm.party.name} 의원({district})은 제{termId}대 국회에서{" "}
        <strong>
          {attendanceLevel} 출석률({formatPercent(attendance.rate)})
        </strong>
        을 기록하고 있습니다. 전체 {voteSummary.total}건의 본회의 표결 중{" "}
        <strong>
          {voteLevel} 참여({formatPercent(voteParticipationRate)})
        </strong>
        하고 있으며, 대표발의 법안은 <strong>{billTotal}건</strong>으로 {billLevel} 입법 활동을
        보이고 있습니다.
        {memberTerm.committees.length > 0 && (
          <> 현재 {memberTerm.committees[0]}에서 활동하고 있습니다.</>
        )}
      </p>
      <p className="mt-2 text-xs text-(--color-text-tertiary)">
        위 요약은 열린국회정보 공공데이터를 기반으로 자동 생성된 분석입니다. 아래 탭에서 상세
        데이터를 확인하세요.
      </p>
    </div>
  );
}
