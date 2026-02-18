import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import DistrictFinder from "@/components/members/DistrictFinder";
import MemberListInner from "@/components/members/MemberListInner";
import MemberListSkeleton from "@/components/skeletons/MemberListSkeleton";
import { DistrictFinderSkeleton } from "@/components/skeletons/HomeSkeleton";

export const metadata: Metadata = {
  title: "의원 목록",
  description: "대수별 국회의원 목록을 검색하고 정당별로 필터링하세요.",
};

interface MembersPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold">의원 목록</h1>

      {/* 내 지역구 의원 찾기 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">내 지역구 의원 찾기</h2>
        <CongressWrapper key={`finder-${termId}`} fallback={<DistrictFinderSkeleton />}>
          <DistrictFinder termId={termId} />
        </CongressWrapper>
      </section>

      {/* 전체 의원 목록 */}
      <CongressWrapper key={`list-${termId}`} fallback={<MemberListSkeleton />}>
        <MemberListInner termId={termId} />
      </CongressWrapper>
    </div>
  );
}
