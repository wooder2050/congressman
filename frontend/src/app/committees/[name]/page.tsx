import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import CommitteeDetailInner from "@/components/committees/CommitteeDetailInner";

interface CommitteeDetailPageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ term?: string }>;
}

export async function generateMetadata({ params }: CommitteeDetailPageProps): Promise<Metadata> {
  const { name } = await params;
  const committeeName = decodeURIComponent(name);
  return {
    title: `${committeeName} - 위원회 상세`,
    description: `${committeeName} 소속 위원, 법안 처리 현황, 회의록을 확인하세요.`,
  };
}

export default async function CommitteeDetailPage({
  params,
  searchParams,
}: CommitteeDetailPageProps) {
  const [{ name }, sp] = await Promise.all([params, searchParams]);
  const committeeName = decodeURIComponent(name);
  const termId = Number(sp.term) || 22;

  return (
    <div className="mx-auto max-w-7xl">
      <CongressWrapper key={`${committeeName}-${termId}`} fallback={<CommitteeDetailSkeleton />}>
        <CommitteeDetailInner name={committeeName} termId={termId} />
      </CongressWrapper>
    </div>
  );
}

function CommitteeDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-(--color-bg-tertiary)" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-(--color-bg-tertiary)" />
        ))}
      </div>
      <div className="h-6 w-32 rounded bg-(--color-bg-tertiary)" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-(--color-bg-tertiary)" />
        ))}
      </div>
      <div className="h-6 w-32 rounded bg-(--color-bg-tertiary)" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-(--color-bg-tertiary)" />
        ))}
      </div>
    </div>
  );
}
