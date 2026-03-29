import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import ScheduleListInner from "@/components/schedules/ScheduleListInner";
import { ScheduleListSkeleton } from "@/components/skeletons/ScheduleSkeleton";

export const metadata: Metadata = {
  title: "국회 일정 — 오늘 본회의·위원회 회의 의사일정 확인",
  description:
    "오늘 국회 본회의 일정과 상임위원회 회의 일정을 확인하세요. 22대 국회 임시회·정기회 일정, 법안 심사 안건, 위원회별 회의 일정을 날짜순으로 정리했습니다. 본회의 표결 예정 법안도 미리 확인할 수 있습니다.",
  alternates: { canonical: "https://www.lawmake.kr/schedule" },
};

interface SchedulePageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 space-y-3">
        <h1 className="text-2xl font-bold">국회 일정</h1>
        <PageIntro
          description="국회 본회의와 상임위원회의 예정된 회의 일정을 확인할 수 있습니다. 국회는 정기회(9월~12월)와 임시회(필요시 소집)를 통해 법안 심사, 예산 심의, 국정감사 등의 업무를 수행합니다."
          details={[
            "본회의 일정: 국회의원 전체가 모여 법안을 최종 의결하는 회의 일정을 확인하세요.",
            "위원회 일정: 각 상임위원회의 법안 심사, 현안 보고 등 회의 일정을 확인할 수 있습니다.",
            "지난 회의와 다가오는 회의를 시간순으로 확인하고, 관심 있는 안건의 심사 일정을 추적하세요.",
          ]}
        />
      </div>
      <CongressWrapper key={termId} fallback={<ScheduleListSkeleton />}>
        <ScheduleListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
