"use client";

import { Suspense } from "react";
import {
  AttendanceTabSkeleton,
  BillsTabSkeleton,
  CommitteeTabSkeleton,
  AssetsTabSkeleton,
} from "@/components/skeletons/TabSkeleton";
import ScorecardTab from "./ScorecardTab";
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
      {activeTab === "scorecard" && (
        <Suspense fallback={<AttendanceTabSkeleton />}>
          <ScorecardTab memberId={memberId} termId={termId} />
        </Suspense>
      )}
      {activeTab === "attendance" && (
        <Suspense fallback={<AttendanceTabSkeleton />}>
          <AttendanceTab memberId={memberId} termId={termId} />
        </Suspense>
      )}
      {activeTab === "bills" && (
        <Suspense fallback={<BillsTabSkeleton />}>
          <BillsTab memberId={memberId} termId={termId} />
        </Suspense>
      )}
      {activeTab === "votes" && <VotesTab memberId={memberId} termId={termId} />}
      {activeTab === "committee" && (
        <Suspense fallback={<CommitteeTabSkeleton />}>
          <CommitteeTab memberId={memberId} termId={termId} />
        </Suspense>
      )}
      {activeTab === "career" && <CareerTab career={career} termId={termId} />}
      {activeTab === "assets" && (
        <Suspense fallback={<AssetsTabSkeleton />}>
          <AssetsTab memberId={memberId} />
        </Suspense>
      )}
    </div>
  );
}
