"use client";

import { useState, Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMember, getMemberTerms } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemberProfile from "./MemberProfile";
import MemberDetailTabContent from "./MemberDetailTabs";
import TabContentSkeleton from "@/components/skeletons/TabSkeleton";

interface MemberDetailInnerProps {
  id: string;
  termId: number;
  defaultTab: string;
}

const TAB_OPTIONS = [
  { value: "attendance", label: "출석" },
  { value: "bills", label: "법안" },
  { value: "votes", label: "표결" },
  { value: "assets", label: "재산" },
] as const;

export default function MemberDetailInner({ id, termId, defaultTab }: MemberDetailInnerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { data: member } = useCongressSuspenseQuery(getMember, id);
  const { data: memberTerms } = useCongressSuspenseQuery(getMemberTerms, id);

  if (!member) return notFound();

  const currentMemberTerm = memberTerms.find((mt) => mt.termId === termId);
  if (!currentMemberTerm) return notFound();

  const allTermIds = memberTerms.map((mt) => mt.termId);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href={`/members?term=${termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 목록으로
      </Link>

      <MemberProfile member={member} memberTerm={currentMemberTerm} allTermIds={allTermIds} />

      {/* 탭 헤더 — 항상 즉시 렌더 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full">
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-base font-semibold">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 탭 콘텐츠 — Suspense 경계 */}
      <Suspense fallback={<TabContentSkeleton />}>
        <MemberDetailTabContent memberId={id} termId={termId} activeTab={activeTab} />
      </Suspense>
    </div>
  );
}
