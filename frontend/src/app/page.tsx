import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import JsonLd from "@/components/seo/JsonLd";
import PageIntro from "@/components/ui/page-intro";
import CongressWrapper from "@/common/CongressWrapper";
import HomeStats from "@/components/home/HomeStats";
import UpcomingSchedules from "@/components/home/UpcomingSchedules";
import TopicSection from "@/components/home/TopicSection";
import RecentActivity from "@/components/home/RecentActivity";
import AttendanceRanking from "@/components/home/AttendanceRanking";
import ActivityHighlights from "@/components/home/ActivityHighlights";
import LatestWeeklyNews from "@/components/home/LatestWeeklyNews";
import PropertyHighlight from "@/components/home/PropertyHighlight";
import ScorecardHighlight from "@/components/home/ScorecardHighlight";
import BreakingNewsBanner from "@/components/home/BreakingNewsBanner";
import LocalElectionBanner from "@/components/home/LocalElectionBanner";
import CivicKnowledge from "@/components/home/CivicKnowledge";
import TopicGuide from "@/components/home/TopicGuide";
import HomeMoreSections from "@/components/home/HomeMoreSections";
import PersonalizedFeed from "@/components/home/PersonalizedFeed";
import {
  HomeStatsSkeleton,
  TopicSectionSkeleton,
  AttendanceRankingSkeleton,
  RecentActivitySkeleton,
  ActivityHighlightsSkeleton,
} from "@/components/skeletons/HomeSkeleton";
import { UpcomingSchedulesSkeleton } from "@/components/skeletons/ScheduleSkeleton";
import { makeQueryClient } from "@/lib/query-client";
import { getHomeStats, getAttendanceRanking, getBillTopics, getUpcomingSchedules } from "@/lib/api";

export const metadata: Metadata = {
  title: "lawmake — 국회의원 법안 발의·표결·출석률 한눈에",
  description:
    "내 지역 국회의원은 누구? 22대 국회의원 295명의 출석률·법안 발의·표결 기록을 검색하고 비교하세요. 의원별 성적표, AI 법안 요약, 선거구 지도까지. 공공데이터 기반 의정활동 플랫폼.",
  alternates: { canonical: "https://www.lawmake.kr" },
  openGraph: {
    title: "lawmake — 국회의원 법안 발의·표결·출석률 한눈에",
    description:
      "내 지역 국회의원은 누구? 22대 국회의원 295명의 출석률·법안 발의·표결 기록을 검색하고 비교하세요.",
    url: "https://www.lawmake.kr",
  },
  twitter: {
    title: "lawmake — 국회의원 법안 발의·표결·출석률 한눈에",
    description:
      "내 지역 국회의원은 누구? 22대 국회의원 295명의 출석률·법안 발의·표결 기록을 검색하고 비교하세요.",
  },
};

interface HomePageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  const queryClient = makeQueryClient();

  // 서버에서 모든 홈 데이터를 병렬로 prefetch
  const prefetches = [
    queryClient.prefetchQuery({
      queryKey: ["homeStats", JSON.stringify(termId)],
      queryFn: () => getHomeStats(termId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["attendanceRanking", JSON.stringify(termId)],
      queryFn: () => getAttendanceRanking(termId),
    }),
  ];

  if (termId === 22) {
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: ["billTopics", JSON.stringify(termId)],
        queryFn: () => getBillTopics(termId),
      }),
      queryClient.prefetchQuery({
        queryKey: ["upcomingSchedules", JSON.stringify(termId)],
        queryFn: () => getUpcomingSchedules(termId),
      }),
    );
  }

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "lawmake",
          alternateName: "국회의원 의정활동 정보",
          url: "https://www.lawmake.kr",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://www.lawmake.kr/members?search={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "국회의원의 역할은 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "국회의원은 국민의 대표로서 법률안을 발의하고 심사하며, 정부 예산안을 심의·확정하고, 행정부를 감시·견제하는 3대 핵심 기능을 수행합니다. 또한 국정감사와 국정조사를 통해 정부 정책의 적정성을 점검합니다.",
              },
            },
            {
              "@type": "Question",
              name: "법안은 어떻게 만들어지나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "법안은 국회의원 10인 이상의 찬성으로 발의되며, 소관 상임위원회 심사 → 법제사법위원회 체계·자구 심사 → 본회의 표결의 3단계를 거칩니다. 재적의원 과반수 출석에 출석의원 과반수가 찬성하면 법률로 확정됩니다.",
              },
            },
            {
              "@type": "Question",
              name: "본회의 표결이란 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "위원회 심사를 통과한 법안이 국회의원 전원이 참석하는 본회의에서 최종 결정되는 절차입니다. 전자투표 방식으로 찬성·반대·기권을 표시하며, 투표 결과는 의원별로 공개됩니다.",
              },
            },
            {
              "@type": "Question",
              name: "lawmake에서 의정활동을 어떻게 평가하나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "lawmake에서는 출석률, 표결 참여율, 법안 발의 건수, 법안 가결률 등 객관적 데이터를 기반으로 의원의 의정활동을 종합 평가합니다. 모든 데이터는 열린국회정보 공공 API에서 제공됩니다.",
              },
            },
          ],
        }}
      />
      <div className="space-y-8">
        {/* 헤더 */}
        <section>
          <h1 className="text-2xl font-bold sm:text-3xl sm:font-extrabold sm:tracking-tight">
            국회의원 의정활동 정보
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
            lawmake는 대한민국 국회의원의 법안 발의, 본회의 표결, 출석 현황 등 핵심 의정활동
            데이터를 시민 누구나 쉽게 확인할 수 있도록 만든 플랫폼입니다. 열린국회정보 공공 API에서
            제공하는 객관적 데이터를 기반으로, 의원별 성적표 비교부터 AI 법안 요약까지 다양한 분석을
            제공합니다. 내 지역 국회의원이 어떤 활동을 하고 있는지, 어떤 법안에 찬성하고 반대했는지
            직접 확인해 보세요.
          </p>
        </section>

        {/* 6·3 지방선거 배너 */}
        <LocalElectionBanner />

        {/* 속보 배너 */}
        <BreakingNewsBanner />

        {/* 통계 요약 */}
        <CongressWrapper key={`stats-${termId}`} fallback={<HomeStatsSkeleton />}>
          <HomeStats termId={termId} />
        </CongressWrapper>

        {/* 내 관심 이슈 레이더 */}
        <PersonalizedFeed termId={termId} />

        {/* 주간 국회 뉴스 */}
        <LatestWeeklyNews />

        {/* 최근 활동 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">최근 활동</h2>
          <CongressWrapper key={`recent-${termId}`} fallback={<RecentActivitySkeleton />}>
            <RecentActivity termId={termId} />
          </CongressWrapper>
        </section>

        {/* 모바일: 접기 / 데스크톱: 항상 표시 */}
        <HomeMoreSections>
          {/* 플랫폼 소개 */}
          <PageIntro
            description="lawmake.kr은 대한민국 국회의 의정활동 데이터를 시민이 쉽게 이해하고 활용할 수 있도록 정리한 플랫폼입니다. 열린국회정보 공공데이터를 기반으로, 국회의원의 법안 발의, 본회의 표결, 출석 현황 등 핵심 의정활동 정보를 제공합니다."
            details={[
              "의원별 법안 발의 건수, 표결 참여율, 출석률 등 의정활동 성적표를 한눈에 비교할 수 있습니다.",
              "발의된 법안의 심사 진행 상황을 단계별로 추적하고, AI 요약으로 법안 내용을 쉽게 파악할 수 있습니다.",
              "본회의 표결에서 각 의원이 어떻게 투표했는지 찬성·반대·기권 내역을 투명하게 공개합니다.",
              "지역구·정당별 의원 검색과 비교 기능으로 내 지역 국회의원의 활동을 확인해 보세요.",
            ]}
          />

          {/* 국회 상식 */}
          <CivicKnowledge />

          {/* 다가오는 일정 — 현재 대수(22대)만 표시 */}
          {termId === 22 && (
            <CongressWrapper key={`schedules-${termId}`} fallback={<UpcomingSchedulesSkeleton />}>
              <UpcomingSchedules termId={termId} />
            </CongressWrapper>
          )}

          {/* 주제별 법안 — AI 요약이 있는 22대만 표시 */}
          {termId === 22 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">지금 국회에서 논의 중인 주제</h2>
              <CongressWrapper key={`topics-${termId}`} fallback={<TopicSectionSkeleton />}>
                <TopicSection termId={termId} />
              </CongressWrapper>
            </section>
          )}

          {/* 주제별 법안 가이드 — 22대만 표시 */}
          {termId === 22 && <TopicGuide />}

          {/* 의정활동 성적표 — 22대만 표시 */}
          {termId === 22 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">의정활동 성적표</h2>
              <CongressWrapper key="scorecard" fallback={<AttendanceRankingSkeleton />}>
                <ScorecardHighlight />
              </CongressWrapper>
            </section>
          )}

          {/* 출석 랭킹 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold">출석 랭킹</h2>
            <CongressWrapper key={`attendance-${termId}`} fallback={<AttendanceRankingSkeleton />}>
              <AttendanceRanking termId={termId} />
            </CongressWrapper>
          </section>

          {/* 국회의원 부동산 현황 — 22대만 표시 */}
          {termId === 22 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">국회의원 부동산 보유 현황</h2>
              <CongressWrapper key="property" fallback={<AttendanceRankingSkeleton />}>
                <PropertyHighlight />
              </CongressWrapper>
            </section>
          )}

          {/* 의정활동 하이라이트 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold">의정활동 하이라이트</h2>
            <CongressWrapper key={`highlights-${termId}`} fallback={<ActivityHighlightsSkeleton />}>
              <ActivityHighlights termId={termId} />
            </CongressWrapper>
          </section>
        </HomeMoreSections>
      </div>
    </HydrationBoundary>
  );
}
