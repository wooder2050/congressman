"use client";

import { Suspense } from "react";
import TabContentSkeleton from "@/components/skeletons/TabSkeleton";
import AttendanceTab from "./AttendanceTab";
import BillsTab from "./BillsTab";
import VotesTab from "./VotesTab";
import CommitteeTab from "./CommitteeTab";
import CareerTab from "./CareerTab";
import AssetsTab from "./AssetsTab";

interface MemberDetailTabContentProps {
  memberId: string;
  termId: number;
  activeTab: string;
  career?: string | null;
}

export default function MemberDetailTabContent({
  memberId,
  termId,
  activeTab,
  career,
}: MemberDetailTabContentProps) {
  return (
    <div>
      {activeTab === "attendance" && (
        <Suspense fallback={<TabContentSkeleton />}>
          <AttendanceTab memberId={memberId} termId={termId} />
        </Suspense>
      )}
      {activeTab === "bills" && (
        <Suspense fallback={<TabContentSkeleton />}>
          <BillsTab memberId={memberId} termId={termId} />
        </Suspense>
      )}
      {activeTab === "votes" && <VotesTab memberId={memberId} termId={termId} />}
      {activeTab === "committee" && (
        <Suspense fallback={<TabContentSkeleton />}>
          <CommitteeTab memberId={memberId} termId={termId} />
        </Suspense>
      )}
      {activeTab === "career" && <CareerTab career={career} />}
      {activeTab === "assets" && (
        <Suspense fallback={<TabContentSkeleton />}>
          <AssetsTab memberId={memberId} />
        </Suspense>
      )}
    </div>
  );
}
