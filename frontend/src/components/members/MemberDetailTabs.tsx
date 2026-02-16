"use client";

import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getAttendance, getAbsenceDetails, getBills, getAssets } from "@/lib/api";
import AttendanceTab from "./AttendanceTab";
import BillsTab from "./BillsTab";
import VotesTab from "./VotesTab";
import AssetsTab from "./AssetsTab";

interface MemberDetailTabContentProps {
  memberId: string;
  termId: number;
  activeTab: string;
}

export default function MemberDetailTabContent({
  memberId,
  termId,
  activeTab,
}: MemberDetailTabContentProps) {
  const { data: attendance } = useCongressSuspenseQuery(getAttendance, {
    memberId,
    termId,
  });
  const { data: absenceDetails } = useCongressSuspenseQuery(getAbsenceDetails, {
    memberId,
    termId,
  });
  const { data: billsResult } = useCongressSuspenseQuery(getBills, {
    memberId,
    termId,
    limit: 100,
  });
  const { data: assets } = useCongressSuspenseQuery(getAssets, memberId);

  return (
    <div>
      {activeTab === "attendance" && (
        <AttendanceTab attendance={attendance} absenceDetails={absenceDetails} />
      )}
      {activeTab === "bills" && <BillsTab bills={billsResult.bills} total={billsResult.total} />}
      {activeTab === "votes" && <VotesTab memberId={memberId} termId={termId} />}
      {activeTab === "assets" && <AssetsTab assets={assets} />}
    </div>
  );
}
