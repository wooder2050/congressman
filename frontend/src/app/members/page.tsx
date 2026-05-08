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
  title: "국회의원 목록 — 22대 국회의원 297명 의정활동 검색",
  description:
    "22대 국회의원 297명의 의정활동 정보를 검색하세요. 지역구 의원 찾기, 정당별 필터, 법안 발의 건수·출석률 비교 기능을 제공합니다. 내 지역 국회의원을 찾아보세요.",
  alternates: { canonical: "https://www.lawmake.kr/members" },
  openGraph: {
    title: "국회의원 목록 — 22대 국회의원 297명 의정활동 검색",
    description:
      "22대 국회의원의 법안 발의, 출석률, 표결 참여를 검색하고 비교하세요. 지역구 의원 찾기 기능 제공.",
    url: "https://www.lawmake.kr/members",
  },
};

interface MembersPageProps {
  searchParams: Promise<{ term?: string; search?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;
  const initialSearch = params.search?.trim() || undefined;

  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "22대 국회의원 의정활동 데이터",
          description:
            "제22대 대한민국 국회(2024년 5월 30일 ~ 2028년 5월 29일)의 현역 국회의원 297명의 의정활동을 종합한 데이터셋입니다. 의원별 프로필(소속 정당·지역구·당선 횟수·약력)과 의정활동 지표인 법안 발의 건수, 본회의 표결 참여 내역, 위원회 출석률, 신고 재산 현황을 제공합니다. 국회사무처와 공공데이터포털 자료를 기반으로 매일 자동 갱신됩니다.",
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
        <h1 className="text-2xl font-bold sm:text-3xl sm:font-extrabold sm:tracking-tight">
          의원 목록
        </h1>
        <PageIntro
          collapsible
          description="현재 제22대 국회는 300명의 국회의원으로 구성되어 있습니다. 국회의원은 국민의 대표로서 법률안을 발의하고, 본회의 표결에 참여하며, 정부를 감시하는 역할을 합니다. 지역구 의원(254명)은 각 선거구 주민의 투표로, 비례대표 의원(46명)은 정당 득표율에 따라 선출됩니다."
          details={[
            "지역구를 입력해 내 지역 국회의원을 빠르게 찾을 수 있습니다.",
            "정당별, 이름별로 의원을 검색하고 법안 발의·출석률 등 의정활동 성적을 비교해 보세요.",
            "의원 프로필을 클릭하면 발의 법안, 표결 이력, 출석 현황 등 상세 활동 정보를 확인할 수 있습니다.",
          ]}
        />
      </div>

      {/* 국회의원 구성 안내 */}
      <section className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="text-lg font-bold">22대 국회의원 구성</h2>
        <div className="space-y-3 text-sm leading-relaxed text-(--color-text-secondary)">
          <p>
            22대 국회는 2024년 5월 30일에 개원하여 2028년 5월 29일까지 4년간의 임기를 수행합니다. 총
            300석 중 지역구 254석, 비례대표 46석으로 구성되어 있으며, 현재 297명의 의원이 활동하고
            있습니다.
          </p>
          <p>
            국회의원의 주요 권한으로는 법률안 발의권, 예산안 심의·확정권, 국정감사·조사권,
            탄핵소추권 등이 있습니다. 국회의원은 헌법에 의해 불체포특권과 면책특권이 보장되며, 국회
            회기 중 체포되지 않을 권리와 국회에서의 발언에 대해 원외에서 책임지지 않을 권리를
            가집니다.
          </p>
          <p>
            국회에는 18개의 상임위원회가 있으며, 각 위원회는 해당 분야의 법안 심사, 청원 심사, 소관
            부처 감독 등의 역할을 수행합니다. 의원들은 최소 1개 이상의 상임위원회에 소속되어 전문
            분야별 입법 활동을 합니다.
          </p>
        </div>
      </section>

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
        <span className="shrink-0 text-sm font-semibold text-purple-600">재산 현황 보기 →</span>
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
          성적표 랭킹 보기 →
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
      <CongressWrapper key={`list-${termId}-${initialSearch ?? ""}`} fallback={<MemberListSkeleton />}>
        <MemberListInner termId={termId} initialSearch={initialSearch} />
      </CongressWrapper>
    </div>
  );
}
