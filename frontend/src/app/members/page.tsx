import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import DistrictFinder from "@/components/members/DistrictFinder";
import MemberListInner from "@/components/members/MemberListInner";
import MemberListSkeleton from "@/components/skeletons/MemberListSkeleton";
import { DistrictFinderSkeleton } from "@/components/skeletons/HomeSkeleton";

export const metadata: Metadata = {
  title: "의원 목록",
  description:
    "국회의원 300명의 의정활동 정보를 검색하세요. 지역구 의원 찾기, 정당별 필터, 법안 발의·출석률 비교 기능을 제공합니다.",
};

interface MembersPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">의원 목록</h1>
        <PageIntro
          description="현재 제22대 국회는 300명의 국회의원으로 구성되어 있습니다. 국회의원은 국민의 대표로서 법률안을 발의하고, 본회의 표결에 참여하며, 정부를 감시하는 역할을 합니다. 지역구 의원(254명)은 각 선거구 주민의 투표로, 비례대표 의원(46명)은 정당 득표율에 따라 선출됩니다."
          details={[
            "지역구를 입력해 내 지역 국회의원을 빠르게 찾을 수 있습니다.",
            "정당별, 이름별로 의원을 검색하고 법안 발의·출석률 등 의정활동 성적을 비교해 보세요.",
            "의원 프로필을 클릭하면 발의 법안, 표결 이력, 출석 현황 등 상세 활동 정보를 확인할 수 있습니다.",
          ]}
        />
      </div>

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
