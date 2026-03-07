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
    title: `${member.name} 의원 역대 의정활동`,
    description: `${member.name} 국회의원의 역대 국회별 출석률, 법안 발의 건수, 표결 참여율 등 의정활동 비교 분석을 확인하세요.`,
    alternates: { canonical: `https://www.lawmake.kr/members/${id}/history` },
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
