import Link from "next/link";
import CongressWrapper from "@/common/CongressWrapper";
import MemberListInner from "@/components/members/MemberListInner";
import MemberListSkeleton from "@/components/skeletons/MemberListSkeleton";

interface HomePageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* 헤더 섹션 */}
      <section>
        <h1 className="text-2xl font-bold">국회의원 의정활동 정보</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          대한민국 국회의원의 의정활동 정보를 한눈에 확인하세요.
        </p>
      </section>

      {/* 의원 검색 + 필터 + 카드 */}
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
