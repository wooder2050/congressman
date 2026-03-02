import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import BillListInner from "@/components/bills/BillListInner";
import BillListSkeleton from "@/components/skeletons/BillListSkeleton";

export const metadata: Metadata = {
  title: "법안 목록",
  description: "대수별 국회의원 발의 법안 목록을 확인하세요.",
};

interface BillsPageProps {
  searchParams: Promise<{ term?: string; topic?: string; committee?: string }>;
}

export default async function BillsPage({ searchParams }: BillsPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;
  const topic = params.topic || undefined;
  const committee = params.committee || undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">법안 목록</h1>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          발의된 법안을 검색하고 필터링하세요.
        </p>
      </div>
      <CongressWrapper
        key={`${termId}-${topic ?? ""}-${committee ?? ""}`}
        fallback={<BillListSkeleton />}
      >
        <BillListInner termId={termId} initialTopic={topic} initialCommittee={committee} />
      </CongressWrapper>
    </div>
  );
}
