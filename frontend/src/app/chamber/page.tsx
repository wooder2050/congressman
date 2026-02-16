import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import ChamberPageInner from "@/components/chamber/ChamberPageInner";
import ChamberSkeleton from "@/components/skeletons/ChamberSkeleton";

export const metadata: Metadata = {
  title: "본회의장",
  description: "300석 본회의장 좌석 배치도를 확인하세요.",
};

interface ChamberPageProps {
  searchParams: Promise<{ term?: string; voteId?: string }>;
}

export default async function ChamberPage({ searchParams }: ChamberPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="-mx-4 -my-4 lg:-my-6">
      <CongressWrapper fallback={<ChamberSkeleton />}>
        <ChamberPageInner key={termId} termId={termId} initialVoteId={params.voteId} />
      </CongressWrapper>
    </div>
  );
}
