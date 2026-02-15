import CongressWrapper from "@/common/CongressWrapper";
import HistoryInner from "@/components/members/HistoryInner";
import HistorySkeleton from "@/components/skeletons/HistorySkeleton";

interface HistoryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}

export default async function HistoryPage({ params, searchParams }: HistoryPageProps) {
  const { id } = await params;
  const { term } = await searchParams;
  const termId = Number(term) || 22;

  return (
    <CongressWrapper fallback={<HistorySkeleton />}>
      <HistoryInner id={id} termId={termId} />
    </CongressWrapper>
  );
}
