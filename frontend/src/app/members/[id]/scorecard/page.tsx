import type { Metadata } from "next";
import Link from "next/link";
import { getMember } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import ScorecardTab from "@/components/members/ScorecardTab";
import { AttendanceTabSkeleton } from "@/components/skeletons/TabSkeleton";

interface ScorecardPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}

export async function generateMetadata({ params }: ScorecardPageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) return { title: "의원 정보 없음" };
  return {
    title: `${member.name} 의원 의정활동 성적표`,
    description: `${member.name} 국회의원의 출석률, 표결 참여율, 법안 발의, 법안 통과율을 종합 평가한 의정활동 성적표입니다.`,
    alternates: { canonical: `https://www.lawmake.kr/members/${id}/scorecard` },
  };
}

export default async function ScorecardPage({ params, searchParams }: ScorecardPageProps) {
  const { id } = await params;
  const { term } = await searchParams;
  const termId = Number(term) || 22;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href={`/members/${id}?term=${termId}&tab=scorecard`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) hover:text-(--color-text-primary)"
      >
        ← 의원 상세로 돌아가기
      </Link>

      <CongressWrapper fallback={<AttendanceTabSkeleton />}>
        <ScorecardTab memberId={id} termId={termId} />
      </CongressWrapper>
    </div>
  );
}
