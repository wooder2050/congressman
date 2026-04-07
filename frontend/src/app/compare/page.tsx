import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import CompareInner from "@/components/compare/CompareInner";
import CompareSkeleton from "@/components/compare/CompareSkeleton";

export const metadata: Metadata = {
  title: "국회의원 1:1 비교 - 출석률·법안 발의·표결 기록 대결",
  description:
    "두 국회의원의 의정활동을 1:1로 비교해보세요. 출석률, 법안 발의 건수, 본회의 표결 참여율을 개표 방송처럼 한눈에 비교할 수 있습니다.",
  alternates: { canonical: "https://www.lawmake.kr/compare" },
};

interface ComparePageProps {
  searchParams: Promise<{ term?: string; members?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;
  const initialMemberIds = params.members ? params.members.split(",") : [];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-black sm:text-4xl">의원 1:1 비교</h1>
        <p className="mt-2 text-sm text-(--color-text-tertiary) sm:text-base">
          두 의원의 의정활동을 개표 방송처럼 비교해보세요.
        </p>
      </div>
      <CongressWrapper key={termId} fallback={<CompareSkeleton />}>
        <CompareInner termId={termId} initialMemberIds={initialMemberIds} />
      </CongressWrapper>
    </div>
  );
}
