import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import ScheduleListInner from "@/components/schedules/ScheduleListInner";
import { ScheduleListSkeleton } from "@/components/skeletons/ScheduleSkeleton";

export const metadata: Metadata = {
  title: "국회 일정",
  description: "본회의 및 위원회 일정을 확인하세요.",
};

interface SchedulePageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">국회 일정</h1>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          본회의 및 위원회 일정을 확인하세요.
        </p>
      </div>
      <CongressWrapper key={termId} fallback={<ScheduleListSkeleton />}>
        <ScheduleListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
