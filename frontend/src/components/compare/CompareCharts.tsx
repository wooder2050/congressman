"use client";

import { useQueries } from "@tanstack/react-query";
import { getAttendance, getBills, getMemberVotes } from "@/lib/api";
import { formatPercent } from "@/lib/utils";
import type { MemberWithTerm, AttendanceRecord, MemberVotesResponse } from "@/types";

interface CompareChartsProps {
  members: MemberWithTerm[];
  termId: number;
}

export default function CompareCharts({ members, termId }: CompareChartsProps) {
  const attendanceResults = useQueries({
    queries: members.map((m) => ({
      queryKey: ["attendance", JSON.stringify({ memberId: m.id, termId })],
      queryFn: () => getAttendance({ memberId: m.id, termId }),
    })),
  });

  const billResults = useQueries({
    queries: members.map((m) => ({
      queryKey: ["bills", JSON.stringify({ termId, memberId: m.id, limit: 1 })],
      queryFn: () => getBills({ termId, memberId: m.id, limit: 1 }),
    })),
  });

  const voteResults = useQueries({
    queries: members.map((m) => ({
      queryKey: ["memberVotes", JSON.stringify({ memberId: m.id, termId, limit: 1 })],
      queryFn: () => getMemberVotes({ memberId: m.id, termId, limit: 1 }),
    })),
  });

  const isLoading =
    attendanceResults.some((q) => q.isLoading) ||
    billResults.some((q) => q.isLoading) ||
    voteResults.some((q) => q.isLoading);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
        ))}
      </div>
    );
  }

  const attendanceData = members.map((m, i) => ({
    member: m,
    rate: (attendanceResults[i].data as AttendanceRecord | null)?.rate ?? 0,
  }));

  const billData = members.map((m, i) => ({
    member: m,
    count: (billResults[i].data as { total: number } | undefined)?.total ?? 0,
  }));

  const voteData = members.map((m, i) => {
    const data = voteResults[i].data as MemberVotesResponse | undefined;
    const summary = data?.summary;
    return {
      member: m,
      yes: summary?.yes ?? 0,
      no: summary?.no ?? 0,
      abstain: summary?.abstain ?? 0,
      absent: summary?.absent ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <CompareBarSection title="출석률" unit="%">
        {attendanceData.map((d) => (
          <CompareBar
            key={d.member.id}
            name={d.member.name}
            value={d.rate}
            maxValue={100}
            color={d.member.term.party.color}
            label={formatPercent(d.rate)}
          />
        ))}
      </CompareBarSection>

      <CompareBarSection title="법안 발의" unit="건">
        {billData.map((d) => (
          <CompareBar
            key={d.member.id}
            name={d.member.name}
            value={d.count}
            maxValue={Math.max(...billData.map((b) => b.count), 1)}
            color={d.member.term.party.color}
            label={`${d.count}건`}
          />
        ))}
      </CompareBarSection>

      <CompareBarSection title="표결 참여">
        {voteData.map((d) => {
          const total = d.yes + d.no + d.abstain + d.absent;
          const participated = d.yes + d.no + d.abstain;
          const rate = total > 0 ? (participated / total) * 100 : 0;
          return (
            <CompareBar
              key={d.member.id}
              name={d.member.name}
              value={rate}
              maxValue={100}
              color={d.member.term.party.color}
              label={`${formatPercent(rate)} (${participated}/${total})`}
            />
          );
        })}
      </CompareBarSection>

      <CompareVoteBreakdown voteData={voteData} />
    </div>
  );
}

function CompareBarSection({
  title,
  unit,
  children,
}: {
  title: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-(--color-border-primary) p-4">
      <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">
        {title}
        {unit && <span className="ml-1 font-normal">({unit})</span>}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function CompareBar({
  name,
  value,
  maxValue,
  color,
  label,
}: {
  name: string;
  value: number;
  maxValue: number;
  color: string;
  label: string;
}) {
  const width = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold text-(--color-text-primary)">{name}</span>
        <span className="text-sm font-bold text-(--color-text-primary)">{label}</span>
      </div>
      <div className="h-6 overflow-hidden rounded-full bg-(--color-bg-tertiary)">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(width, 1)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function CompareVoteBreakdown({
  voteData,
}: {
  voteData: {
    member: MemberWithTerm;
    yes: number;
    no: number;
    abstain: number;
    absent: number;
  }[];
}) {
  return (
    <div className="rounded-xl border border-(--color-border-primary) p-4">
      <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">표결 성향</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border-primary)">
              <th className="pb-2 text-left font-semibold text-(--color-text-tertiary)">의원</th>
              <th className="pb-2 text-right font-semibold text-(--color-status-present)">찬성</th>
              <th className="pb-2 text-right font-semibold text-(--color-status-absent)">반대</th>
              <th className="pb-2 text-right font-semibold text-(--color-status-pending)">기권</th>
              <th className="pb-2 text-right font-semibold text-(--color-text-tertiary)">불참</th>
            </tr>
          </thead>
          <tbody>
            {voteData.map((d) => (
              <tr
                key={d.member.id}
                className="border-b border-(--color-border-primary) last:border-0"
              >
                <td className="py-2 font-semibold">{d.member.name}</td>
                <td className="py-2 text-right">{d.yes}</td>
                <td className="py-2 text-right">{d.no}</td>
                <td className="py-2 text-right">{d.abstain}</td>
                <td className="py-2 text-right">{d.absent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
