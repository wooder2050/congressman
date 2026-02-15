"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AttendanceTab from "./AttendanceTab";
import BillsTab from "./BillsTab";
import type { AttendanceRecord, AbsenceDetail, Bill } from "@/types";

interface MemberDetailClientProps {
  attendance: AttendanceRecord | null;
  absenceDetails: AbsenceDetail[];
  bills: Bill[];
  defaultTab?: string;
}

export default function MemberDetailClient({
  attendance,
  absenceDetails,
  bills,
  defaultTab = "attendance",
}: MemberDetailClientProps) {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="attendance" className="text-base font-semibold">
          출석
        </TabsTrigger>
        <TabsTrigger value="bills" className="text-base font-semibold">
          법안
        </TabsTrigger>
      </TabsList>
      <TabsContent value="attendance">
        <AttendanceTab attendance={attendance} absenceDetails={absenceDetails} />
      </TabsContent>
      <TabsContent value="bills">
        <BillsTab bills={bills} />
      </TabsContent>
    </Tabs>
  );
}
