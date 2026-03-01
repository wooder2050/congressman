import CongressWrapper from "@/common/CongressWrapper";
import HomeStats from "@/components/home/HomeStats";
import UpcomingSchedules from "@/components/home/UpcomingSchedules";
import TopicSection from "@/components/home/TopicSection";
import RecentActivity from "@/components/home/RecentActivity";
import AttendanceRanking from "@/components/home/AttendanceRanking";
import ActivityHighlights from "@/components/home/ActivityHighlights";
import {
  HomeStatsSkeleton,
  TopicSectionSkeleton,
  AttendanceRankingSkeleton,
  RecentActivitySkeleton,
  ActivityHighlightsSkeleton,
} from "@/components/skeletons/HomeSkeleton";
import { UpcomingSchedulesSkeleton } from "@/components/skeletons/ScheduleSkeleton";

interface HomePageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* 헤더 */}
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">국회의원 의정활동 정보</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          대한민국 국회의원의 의정활동 정보를 한눈에 확인하세요.
        </p>
      </section>

      {/* 통계 요약 */}
      <CongressWrapper key={`stats-${termId}`} fallback={<HomeStatsSkeleton />}>
        <HomeStats termId={termId} />
      </CongressWrapper>

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

      {/* 출석 랭킹 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">출석 랭킹</h2>
        <CongressWrapper key={`attendance-${termId}`} fallback={<AttendanceRankingSkeleton />}>
          <AttendanceRanking termId={termId} />
        </CongressWrapper>
      </section>

      {/* 의정활동 하이라이트 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">의정활동 하이라이트</h2>
        <CongressWrapper key={`highlights-${termId}`} fallback={<ActivityHighlightsSkeleton />}>
          <ActivityHighlights termId={termId} />
        </CongressWrapper>
      </section>
    </div>
  );
}
