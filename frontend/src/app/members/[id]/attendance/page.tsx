import type { Metadata } from "next";
import { getMember } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import AttendanceDetailInner from "@/components/members/AttendanceDetailInner";
import AttendanceDetailSkeleton from "@/components/skeletons/AttendanceDetailSkeleton";

interface AttendancePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}

export async function generateMetadata({ params }: AttendancePageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) return { title: "의원 정보 없음" };
  return {
    title: `${member.name} 의원 출석률·표결 참여`,
    description: `${member.name} 국회의원의 본회의 출석률, 상임위원회 출석 현황, 표결 참여 내역을 확인하세요.`,
    alternates: { canonical: `https://www.lawmake.kr/members/${id}/attendance` },
  };
}

export default async function AttendancePage({ params, searchParams }: AttendancePageProps) {
  const { id } = await params;
  const { term } = await searchParams;
  const termId = Number(term) || 22;

  return (
    <CongressWrapper fallback={<AttendanceDetailSkeleton />}>
      <AttendanceDetailInner id={id} termId={termId} />
    </CongressWrapper>
  );
}
