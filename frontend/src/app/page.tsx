import Link from "next/link";
import CongressWrapper from "@/common/CongressWrapper";
import HomeStats from "@/components/home/HomeStats";
import DistrictFinder from "@/components/home/DistrictFinder";
import RecentActivity from "@/components/home/RecentActivity";
import MemberListInner from "@/components/members/MemberListInner";
import MemberListSkeleton from "@/components/skeletons/MemberListSkeleton";
import {
  HomeStatsSkeleton,
  DistrictFinderSkeleton,
  RecentActivitySkeleton,
} from "@/components/skeletons/HomeSkeleton";

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
        <h1 className="text-2xl font-bold">국회의원 의정활동 정보</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          대한민국 국회의원의 의정활동 정보를 한눈에 확인하세요.
        </p>
      </section>

      {/* 통계 요약 */}
      <CongressWrapper fallback={<HomeStatsSkeleton />}>
        <HomeStats termId={termId} />
      </CongressWrapper>

      {/* 내 지역구 의원 찾기 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">내 지역구 의원 찾기</h2>
        <CongressWrapper fallback={<DistrictFinderSkeleton />}>
          <DistrictFinder termId={termId} />
        </CongressWrapper>
      </section>

      {/* 최근 활동 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">최근 활동</h2>
        <CongressWrapper fallback={<RecentActivitySkeleton />}>
          <RecentActivity termId={termId} />
        </CongressWrapper>
      </section>

      {/* 의원 목록 프리뷰 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">의원 목록</h2>
          <Link
            href={`/members?term=${termId}`}
            className="text-sm font-semibold text-(--color-primary) no-underline"
          >
            전체 보기 →
          </Link>
        </div>
        <CongressWrapper fallback={<MemberListSkeleton />}>
          <MemberListInner termId={termId} />
        </CongressWrapper>
      </section>
    </div>
  );
}
