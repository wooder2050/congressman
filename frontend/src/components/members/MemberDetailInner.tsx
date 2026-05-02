"use client";

import { useState, Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMember, getMemberTerms } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import MemberProfile from "./MemberProfile";
import MemberActivitySummary from "./MemberActivitySummary";
import MemberRecentActivityCard from "./MemberRecentActivityCard";
import MemberDetailTabContent from "./MemberDetailTabs";

const ActivityHeatmap = dynamic(() => import("./ActivityHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-50 items-center justify-center rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
      <span className="text-sm text-(--color-text-tertiary)">불러오는 중...</span>
    </div>
  ),
});

interface MemberDetailInnerProps {
  id: string;
  termId: number;
  defaultTab: string;
}

const TAB_OPTIONS = [
  { value: "scorecard", label: "성적표" },
  { value: "attendance", label: "출석" },
  { value: "bills", label: "법안" },
  { value: "votes", label: "표결" },
  { value: "committee", label: "위원회" },
  { value: "career", label: "경력" },
  { value: "assets", label: "재산" },
] as const;

export default function MemberDetailInner({ id, termId, defaultTab }: MemberDetailInnerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { data: member } = useCongressSuspenseQuery(getMember, id);
  const { data: memberTerms } = useCongressSuspenseQuery(getMemberTerms, id);

  if (!member) return notFound();

  const currentMemberTerm = memberTerms.find((mt) => mt.termId === termId);
  const allTermIds = memberTerms.map((mt) => mt.termId);

  if (!currentMemberTerm) {
    const availableTerms = memberTerms.map((mt) => mt.termId).sort((a, b) => b - a);

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href={`/members?term=${termId}`}
          className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
        >
          ← 목록으로
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) py-16 text-center">
          <p className="mb-2 text-lg font-bold text-(--color-text-primary)">
            {member.name} 의원은 제{termId}대 국회 활동 기록이 없습니다.
          </p>
          <div className="mt-4 flex gap-3">
            {availableTerms.map((t) => (
              <Link
                key={t}
                href={`/members/${id}?term=${t}`}
                className="rounded-lg bg-(--color-member-accent) px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:opacity-90"
              >
                제{t}대 활동 보기
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-7xl space-y-6"
      style={{ "--color-member-accent": currentMemberTerm.party.color } as React.CSSProperties}
    >
      <Link
        href={`/members?term=${termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 목록으로
      </Link>

      <MemberProfile member={member} memberTerm={currentMemberTerm} allTermIds={allTermIds} />

      <MemberRecentActivityCard memberId={id} termId={termId} />

      <Suspense fallback={null}>
        <MemberActivitySummary
          memberId={id}
          memberName={member.name}
          memberTerm={currentMemberTerm}
        />
      </Suspense>

      <ActivityHeatmap
        key={termId}
        memberId={id}
        termId={termId}
        partyColor={currentMemberTerm.party.color}
      />

      {/* 탭 헤더 — 항상 즉시 렌더 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full">
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-base font-semibold after:bg-(--color-member-accent)!"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 탭 콘텐츠 — 각 탭 내부에서 개별 Suspense */}
      <MemberDetailTabContent
        memberId={id}
        termId={termId}
        activeTab={activeTab}
        career={member.career}
      />
    </div>
  );
}
