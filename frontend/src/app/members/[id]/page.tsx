import type { Metadata } from "next";
import { getMember } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import MemberDetailInner from "@/components/members/MemberDetailInner";
import MemberDetailSkeleton from "@/components/skeletons/MemberDetailSkeleton";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string; tab?: string }>;
}

export async function generateMetadata({ params }: MemberDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) return { title: "의원 정보 없음" };
  return {
    title: `${member.name} 의원`,
    description: `${member.name} 국회의원의 출석, 법안 발의 등 의정활동 정보`,
  };
}

export default async function MemberDetailPage({ params, searchParams }: MemberDetailPageProps) {
  const { id } = await params;
  const { term, tab } = await searchParams;
  const termId = Number(term) || 22;

  return (
    <CongressWrapper fallback={<MemberDetailSkeleton />}>
      <MemberDetailInner id={id} termId={termId} defaultTab={tab || "attendance"} />
    </CongressWrapper>
  );
}
