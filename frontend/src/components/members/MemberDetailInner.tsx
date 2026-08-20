"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import MemberProfile from "./MemberProfile";
import MemberActivitySummary from "./MemberActivitySummary";
import MemberRecentActivityCard from "./MemberRecentActivityCard";
import MemberRecentBills from "./MemberRecentBills";
import MemberDetailTabContent from "./MemberDetailTabs";
import type { Member, MemberTerm } from "@/types";

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
  member: Member;
  memberTerms: MemberTerm[];
  /** 22대 활동 요약 — 페이지 서버 컴포넌트가 SSR한 노드 (네이버 등 비JS 크롤러 대응) */
  summarySlot?: React.ReactNode;
}

/**
 * ?term / ?tab 쿼리를 클라이언트에서 상태로 반영하는 브리지.
 * 페이지를 ISR(정적)로 유지하기 위해 서버에서 searchParams를 읽지 않는다 —
 * useSearchParams는 Suspense 경계 안에서만 프리렌더가 허용되므로 별도 컴포넌트로 분리.
 */
function SearchParamsBridge({
  onParams,
}: {
  onParams: (term: number | null, tab: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const term = searchParams.get("term");
  const tab = searchParams.get("tab");
  useEffect(() => {
    onParams(term ? Number(term) : null, tab);
    // onParams는 렌더마다 새로 만들어지는 콜백 — term/tab 변화에만 반응한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, tab]);
  return null;
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

export default function MemberDetailInner({
  id,
  member,
  memberTerms,
  summarySlot,
}: MemberDetailInnerProps) {
  const [termId, setTermId] = useState(22);
  const [activeTab, setActiveTab] = useState("attendance");

  const currentMemberTerm = memberTerms.find((mt) => mt.termId === termId);
  const allTermIds = memberTerms.map((mt) => mt.termId);

  const bridge = (
    <Suspense fallback={null}>
      <SearchParamsBridge
        onParams={(term, tab) => {
          if (term !== null && !Number.isNaN(term)) setTermId(term);
          if (tab) setActiveTab(tab);
        }}
      />
    </Suspense>
  );

  if (!currentMemberTerm) {
    const availableTerms = memberTerms.map((mt) => mt.termId).sort((a, b) => b - a);

    return (
      <div className="mx-auto max-w-7xl space-y-6">
        {bridge}
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
      {bridge}
      <Link
        href={`/members?term=${termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 목록으로
      </Link>

      <MemberProfile member={member} memberTerm={currentMemberTerm} allTermIds={allTermIds} />

      <MemberRecentActivityCard memberId={id} termId={termId} />

      {/* 22대는 서버가 SSR한 요약을 그대로 사용 (네이버 크롤러가 본문을 읽도록),
          과거 대수 전환 시에만 클라이언트 쿼리 경로로 대체 */}
      {termId === 22 && summarySlot ? (
        summarySlot
      ) : (
        <Suspense fallback={null}>
          <MemberActivitySummary
            memberId={id}
            memberName={member.name}
            memberTerm={currentMemberTerm}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <MemberRecentBills memberId={id} memberName={member.name} termId={termId} />
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
