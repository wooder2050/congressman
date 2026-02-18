import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import CompareInner from "@/components/compare/CompareInner";
import CompareSkeleton from "@/components/compare/CompareSkeleton";

export const metadata: Metadata = {
  title: "의원 비교",
  description: "국회의원의 의정활동을 비교해보세요.",
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold">의원 비교</h1>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          의원의 의정활동을 나란히 비교해보세요.
        </p>
      </div>
      <CongressWrapper key={termId} fallback={<CompareSkeleton />}>
        <CompareInner termId={termId} initialMemberIds={initialMemberIds} />
      </CongressWrapper>
    </div>
  );
}
