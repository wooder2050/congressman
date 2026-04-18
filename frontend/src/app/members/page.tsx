import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import DistrictFinder from "@/components/members/DistrictFinder";
import MemberListInner from "@/components/members/MemberListInner";
import MemberListSkeleton from "@/components/skeletons/MemberListSkeleton";
import { DistrictFinderSkeleton } from "@/components/skeletons/HomeSkeleton";

export const metadata: Metadata = {
  title: "국회의원 목록 — 22대 국회의원 295명 의정활동 검색",
  description:
    "22대 국회의원 295명의 의정활동 정보를 검색하세요. 지역구 의원 찾기, 정당별 필터, 법안 발의 건수·출석률 비교 기능을 제공합니다. 내 지역 국회의원을 찾아보세요.",
  alternates: { canonical: "https://www.lawmake.kr/members" },
  openGraph: {
    title: "국회의원 목록 — 22대 국회의원 295명 의정활동 검색",
    description:
      "22대 국회의원의 법안 발의, 출석률, 표결 참여를 검색하고 비교하세요. 지역구 의원 찾기 기능 제공.",
    url: "https://www.lawmake.kr/members",
  },
};

interface MembersPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "22대 국회의원 의정활동 데이터",
          description: "22대 국회의원 295명의 법안 발의, 본회의 표결, 출석률, 재산 현황 데이터",
          url: "https://www.lawmake.kr/members",
          keywords: ["국회의원", "의정활동", "법안 발의", "표결", "출석률"],
          license: "https://www.data.go.kr/ugs/selectPublicDataUseGuide.do",
          temporalCoverage: "2024-05-30/..",
          creator: {
            "@type": "Organization",
            name: "lawmake.kr",
            url: "https://www.lawmake.kr",
          },
        }}
      />
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

      {/* 부동산 현황 배너 */}
      <Link
        href="/members/property"
        className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4 no-underline transition-colors hover:bg-purple-100"
      >
        <div>
          <div className="text-sm font-bold text-purple-900">국회의원 부동산 보유 현황</div>
          <div className="mt-0.5 text-xs text-purple-700">
            2024년 재산신고 기준 다주택자·고가주택·부동산 과다보유 현황
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-purple-600">보기 →</span>
      </Link>

      {/* 성적표 랭킹 배너 */}
      <Link
        href="/members/scorecard"
        className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 no-underline transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
      >
        <div>
          <div className="text-sm font-bold text-blue-900 dark:text-blue-200">
            의정활동 성적표 랭킹
          </div>
          <div className="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
            출석률·표결참여율·법안발의·법안통과율 종합 평가
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-blue-600 dark:text-blue-300">
          보기 →
        </span>
      </Link>

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
