"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getCommitteeBills, getCommitteeActivity, getMemberTerms } from "@/lib/api";
import BarChart from "@/components/charts/BarChart";
import { MEMBER_VOTE_RESULT_MAP } from "@/lib/constants";
import type { CommitteeActivity } from "@/types";

interface CommitteeTabProps {
  memberId: string;
  termId: number;
}

const ROLE_INFO: Record<string, { label: string; description: string; color: string }> = {
  위원장: {
    label: "위원장",
    description: "위원회를 대표하고 의사를 정리하며, 위원회의 질서를 유지합니다.",
    color: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30",
  },
  간사: {
    label: "간사",
    description: "위원장을 보좌하고, 위원회 일정 및 안건 협의를 담당합니다.",
    color: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30",
  },
  위원: {
    label: "위원",
    description: "안건 심사, 질의, 토론 및 표결에 참여합니다.",
    color: "text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800",
  },
};

const isSpecialCommittee = (name: string) => name.includes("특별위원회");

export default function CommitteeTab({ memberId, termId }: CommitteeTabProps) {
  const { data: committeeBills } = useCongressSuspenseQuery(getCommitteeBills, {
    memberId,
    termId,
  });
  const { data: committeeActivity } = useCongressSuspenseQuery(getCommitteeActivity, {
    memberId,
    termId,
  });
  const { data: memberTerms } = useCongressSuspenseQuery(getMemberTerms, memberId);
  const currentTerm = memberTerms.find((mt) => mt.termId === termId);
  const committees = currentTerm?.committees ?? [];
  const committeeRole = currentTerm?.committeeRole ?? "위원";

  const hasCommittees = committees.length > 0;
  const hasBills = committeeBills.length > 0;

  if (!hasCommittees && !hasBills) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">
        위원회 활동 데이터가 없습니다.
      </div>
    );
  }

  const standingCommittees = committees.filter((c) => !isSpecialCommittee(c));
  const specialCommittees = committees.filter(isSpecialCommittee);
  const activityMap = new Map(committeeActivity.map((a) => [a.committee, a]));
  const roleInfo = ROLE_INFO[committeeRole] ?? ROLE_INFO["위원"];

  // 차트 데이터 (상위 10개만)
  const barData = committeeBills.slice(0, 10).map((cb) => ({
    위원회: cb.committee.replace("위원회", ""),
    법안수: cb.count,
  }));

  return (
    <div className="space-y-6 py-4" role="tabpanel">
      {/* 직책 카드 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
        <div className="flex items-center gap-3">
          <span className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
          <p className="text-sm text-(--color-text-secondary)">{roleInfo.description}</p>
        </div>
      </div>

      {/* 상임위원회별 활동 */}
      {standingCommittees.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">
            상임위원회 활동
          </h3>
          <div className="space-y-3">
            {standingCommittees.map((committee) => (
              <CommitteeActivityCard
                key={committee}
                committee={committee}
                activity={activityMap.get(committee)}
                highlight
              />
            ))}
          </div>
        </div>
      )}

      {/* 특별위원회 */}
      {specialCommittees.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">특별위원회</h3>
          <div className="space-y-3">
            {specialCommittees.map((committee) => (
              <CommitteeActivityCard
                key={committee}
                committee={committee}
                activity={activityMap.get(committee)}
                highlight={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* 위원회별 발의 법안 차트 */}
      {hasBills && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">
            위원회별 발의 법안
          </h3>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
            <BarChart
              data={barData}
              xKey="위원회"
              bars={[{ dataKey: "법안수", color: "var(--color-primary)", label: "법안 수" }]}
              height={Math.max(200, barData.length * 30)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CommitteeActivityCard({
  committee,
  activity,
  highlight,
}: {
  committee: string;
  activity?: CommitteeActivity;
  highlight: boolean;
}) {
  const attendanceRate =
    activity && activity.totalVotes > 0
      ? Math.round(((activity.totalVotes - activity.absent) / activity.totalVotes) * 100)
      : null;

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-(--color-primary)/20 bg-(--color-primary)/5"
          : "border-(--color-border-primary) bg-(--color-bg-secondary)"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold text-(--color-text-primary)">{committee}</h4>
        {activity && activity.billCount > 0 && (
          <span className="text-sm text-(--color-primary)">발의 {activity.billCount}건</span>
        )}
      </div>

      {activity && activity.totalVotes > 0 ? (
        <div className="space-y-2">
          {/* 표결 참여 바 */}
          <div className="flex h-2.5 overflow-hidden rounded-full bg-(--color-bg-tertiary)">
            {activity.yes > 0 && (
              <div
                className="h-full"
                style={{
                  width: `${(activity.yes / activity.totalVotes) * 100}%`,
                  backgroundColor: MEMBER_VOTE_RESULT_MAP.yes.color,
                }}
              />
            )}
            {activity.no > 0 && (
              <div
                className="h-full"
                style={{
                  width: `${(activity.no / activity.totalVotes) * 100}%`,
                  backgroundColor: MEMBER_VOTE_RESULT_MAP.no.color,
                }}
              />
            )}
            {activity.abstain > 0 && (
              <div
                className="h-full"
                style={{
                  width: `${(activity.abstain / activity.totalVotes) * 100}%`,
                  backgroundColor: MEMBER_VOTE_RESULT_MAP.abstain.color,
                }}
              />
            )}
            {activity.absent > 0 && (
              <div
                className="h-full"
                style={{
                  width: `${(activity.absent / activity.totalVotes) * 100}%`,
                  backgroundColor: MEMBER_VOTE_RESULT_MAP.absent.color,
                }}
              />
            )}
          </div>

          {/* 수치 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--color-text-tertiary)">
            <span>표결 {activity.totalVotes}건</span>
            {attendanceRate !== null && <span>참여율 {attendanceRate}%</span>}
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: MEMBER_VOTE_RESULT_MAP.yes.color }}
              />
              찬성 {activity.yes}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: MEMBER_VOTE_RESULT_MAP.no.color }}
              />
              반대 {activity.no}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: MEMBER_VOTE_RESULT_MAP.abstain.color }}
              />
              기권 {activity.abstain}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: MEMBER_VOTE_RESULT_MAP.absent.color }}
              />
              불참 {activity.absent}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-(--color-text-tertiary)">표결 데이터 없음</p>
      )}
    </div>
  );
}
