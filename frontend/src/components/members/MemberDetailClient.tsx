"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import AttendanceTab from "./AttendanceTab";
import BillsTab from "./BillsTab";
import type { AttendanceRecord, AbsenceDetail, Bill } from "@/types";

interface MemberDetailClientProps {
  attendance: AttendanceRecord | null;
  absenceDetails: AbsenceDetail[];
  bills: Bill[];
  defaultTab?: string;
}

const tabs = [
  { id: "attendance", label: "출석" },
  { id: "bills", label: "법안" },
];

export default function MemberDetailClient({
  attendance,
  absenceDetails,
  bills,
  defaultTab = "attendance",
}: MemberDetailClientProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "attendance" && (
        <AttendanceTab attendance={attendance} absenceDetails={absenceDetails} />
      )}
      {activeTab === "bills" && <BillsTab bills={bills} />}
    </div>
  );
}
