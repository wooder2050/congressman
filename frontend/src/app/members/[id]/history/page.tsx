import type { Metadata } from "next";
import { getMember } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import HistoryInner from "@/components/members/HistoryInner";
import HistorySkeleton from "@/components/skeletons/HistorySkeleton";

interface HistoryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}

export async function generateMetadata({ params }: HistoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) return { title: "의원 정보 없음" };
  return {
    title: `${member.name} 의원 역대 활동`,
    description: `${member.name} 국회의원의 역대 출석률, 법안 발의 등 의정활동 비교`,
  };
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
