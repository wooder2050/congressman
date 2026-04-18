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
      <div className="mx-auto max-w-7xl space-y-8">
        {/* 헤더 */}
        <section>
          <h1 className="text-3xl font-extrabold tracking-tight">국회의원 의정활동 정보</h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            대한민국 국회의원의 의정활동 정보를 한눈에 확인하세요.
          </p>
        </section>

        {/* 속보 배너 */}
        <BreakingNewsBanner />

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

        {/* 통계 요약 */}
        <CongressWrapper key={`stats-${termId}`} fallback={<HomeStatsSkeleton />}>
          <HomeStats termId={termId} />
        </CongressWrapper>

        {/* 주간 국회 뉴스 */}
        <LatestWeeklyNews />

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

        {/* 최근 활동 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">최근 활동</h2>
          <CongressWrapper key={`recent-${termId}`} fallback={<RecentActivitySkeleton />}>
            <RecentActivity termId={termId} />
          </CongressWrapper>
        </section>

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
      </div>
    </HydrationBoundary>
  );
}
