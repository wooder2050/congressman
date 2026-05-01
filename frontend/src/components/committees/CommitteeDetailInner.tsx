"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCongressSuspenseQuery, useCongressQuery } from "@/hooks/useCongressQuery";
import { getCommitteeDetail, getCommitteeMinutes } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { proxyPhotoUrl } from "@/lib/photo";
import Pagination from "@/components/ui/pagination";
import type { CommitteeMemberInfo, MeetingMinutesSummary, CommitteeNextSchedule } from "@/types";

interface CommitteeDetailInnerProps {
  name: string;
  termId: number;
}

export default function CommitteeDetailInner({ name, termId }: CommitteeDetailInnerProps) {
  const { data } = useCongressSuspenseQuery(getCommitteeDetail, { name, termId });

  if (!data) {
    return (
      <div className="py-8 text-center text-(--color-text-tertiary)">위원회 데이터가 없습니다.</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <Link
          href={`/committees?term=${termId}`}
          className="text-sm text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
        >
          &larr; 위원회 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-(--color-text-primary)">{data.name}</h1>
      </div>

      {/* 법안 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="접수 법안" value={(data.billTotal ?? 0).toLocaleString()} />
        <StatCard
          label="통과"
          value={(data.billPassed ?? 0).toLocaleString()}
          color="text-green-600"
        />
        <StatCard label="통과율" value={`${data.passRate ?? 0}%`} />
      </div>

      {/* 다가오는 일정 */}
      {data.upcomingSchedules?.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-(--color-text-primary)">다가오는 일정</h2>
          <div className="space-y-2">
            {data.upcomingSchedules.map((s: CommitteeNextSchedule, i: number) => (
              <div
                key={i}
                className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-3"
              >
                <p className="text-sm font-medium text-(--color-text-primary)">
                  {formatDate(s.meetingDate)}
                  {s.meetingTime && ` ${s.meetingTime}`}
                </p>
                <p className="text-sm text-(--color-text-secondary)">{s.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 소속 위원 */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-(--color-text-primary)">
          소속 위원 ({data.members?.length ?? 0}명)
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(data.members ?? []).map((m: CommitteeMemberInfo) => (
            <MemberCard key={m.memberId} member={m} termId={termId} />
          ))}
        </div>
      </section>

      {/* 회의록 */}
      <MinutesSection name={name} termId={termId} />

      {/* 소관 법안 보기 링크 */}
      <div className="text-center">
        <Link
          href={`/bills?committee=${encodeURIComponent(name)}&term=${termId}`}
          className="inline-block rounded-lg border border-(--color-border-primary) px-6 py-3 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary)"
        >
          소관 법안 전체 보기
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center">
      <p className={`text-2xl font-bold ${color ?? "text-(--color-text-primary)"}`}>{value}</p>
      <p className="text-xs text-(--color-text-tertiary)">{label}</p>
    </div>
  );
}

function MemberCard({ member, termId }: { member: CommitteeMemberInfo; termId: number }) {
  return (
    <Link
      href={`/members/${member.memberId}?term=${termId}`}
      className="flex items-center gap-2 rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-shadow hover:shadow-sm"
    >
      {member.photoUrl ? (
        <Image
          src={proxyPhotoUrl(member.photoUrl)}
          alt={member.name}
          width={36}
          height={36}
          unoptimized
          className="rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-bg-tertiary) text-xs font-medium text-(--color-text-tertiary)">
          {member.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-(--color-text-primary)">{member.name}</p>
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: member.partyColor }}
          />
          <span className="truncate text-xs text-(--color-text-tertiary)">
            {member.role !== "위원" ? member.role : member.partyName}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MinutesSection({ name, termId }: { name: string; termId: number }) {
  const [page, setPage] = useState(1);
  const { data, isError } = useCongressQuery(getCommitteeMinutes, { name, termId, page });

  if (isError) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold text-(--color-text-primary)">회의록</h2>
        <p className="text-sm text-(--color-text-tertiary)">회의록을 불러오지 못했습니다.</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold text-(--color-text-primary)">회의록</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-(--color-bg-tertiary)" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">회의록 ({data.total}건)</h2>
      </div>
      {data.items?.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.items.map((m: MeetingMinutesSummary) => (
              <MinutesCard key={m.id} minutes={m} />
            ))}
          </div>
          <div className="mt-4">
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <p className="text-sm text-(--color-text-tertiary)">회의록 데이터가 없습니다.</p>
      )}
    </section>
  );
}

function MinutesCard({ minutes }: { minutes: MeetingMinutesSummary }) {
  const agendas = minutes.agendas ?? [];
  const hasLinks = agendas.some((a) => a.confLinkUrl || a.vodLinkUrl || a.pdfLinkUrl);

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-(--color-text-primary)">{minutes.title}</p>
          <p className="mt-1 text-xs text-(--color-text-tertiary)">
            {formatDate(minutes.confDate)}
            {minutes.className && ` | ${minutes.className}`}
            {` | 안건 ${minutes.agendaCount}건`}
          </p>
        </div>
      </div>

      {/* 안건 목록 */}
      {agendas.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {agendas.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-xs text-(--color-text-tertiary)">{i + 1}.</span>
              <p className="flex-1 text-xs text-(--color-text-secondary)">{a.subName}</p>
              <div className="flex shrink-0 gap-1">
                {a.confLinkUrl && (
                  <a
                    href={a.confLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
                  >
                    회의록
                  </a>
                )}
                {a.vodLinkUrl && (
                  <a
                    href={a.vodLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
                  >
                    VOD
                  </a>
                )}
                {a.pdfLinkUrl && (
                  <a
                    href={a.pdfLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
                  >
                    PDF
                  </a>
                )}
              </div>
            </div>
          ))}
          {agendas.length > 3 && (
            <p className="text-xs text-(--color-text-tertiary)">외 {agendas.length - 3}건</p>
          )}
        </div>
      )}

      {/* 전체 링크 (안건별 링크가 없을 때) */}
      {!hasLinks && agendas.length === 0 && (
        <p className="mt-2 text-xs text-(--color-text-tertiary)">링크 정보 없음</p>
      )}
    </div>
  );
}
