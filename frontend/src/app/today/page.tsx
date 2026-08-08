import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import TodayBriefing from "@/components/today/TodayBriefing";
import BreakingNewsFeed from "@/components/today/BreakingNewsFeed";

export const revalidate = 0;

const DESCRIPTION =
  "국회 속보를 항목별 상세와 출처까지 한곳에서 확인하세요. 본회의·위원회 일정, 최근 표결 결과, 발의 법안까지 오늘의 국회를 3분 안에 파악합니다.";

export const metadata: Metadata = {
  title: "오늘의 국회 — 속보·3분 브리핑",
  description: DESCRIPTION,
  alternates: { canonical: "https://www.lawmake.kr/today" },
  openGraph: {
    title: "오늘의 국회 — 속보·3분 브리핑",
    description: DESCRIPTION,
    url: "https://www.lawmake.kr/today",
  },
};

export default function TodayPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">오늘의 국회</h1>
        <p className="text-sm text-(--color-text-secondary)">
          속보와 오늘의 국회 상황을 3분 안에 파악하세요.
        </p>
      </div>

      {/* 속보 — 홈 배너에서 생략되는 항목별 상세·출처를 여기서 제공 */}
      <CongressWrapper fallback={<BreakingNewsFeedSkeleton />}>
        <BreakingNewsFeed />
      </CongressWrapper>

      <CongressWrapper fallback={<TodayBriefingSkeleton />}>
        <TodayBriefing termId={22} />
      </CongressWrapper>
    </div>
  );
}

function BreakingNewsFeedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-20 animate-pulse rounded bg-(--color-bg-tertiary)" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
        >
          <div className="mb-3 h-4 w-32 animate-pulse rounded bg-(--color-bg-tertiary)" />
          <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-(--color-bg-tertiary)" />
          <div className="h-16 animate-pulse rounded bg-(--color-bg-tertiary)" />
        </div>
      ))}
    </div>
  );
}

function TodayBriefingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
        >
          <div className="mb-4 h-5 w-24 animate-pulse rounded bg-(--color-bg-tertiary)" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-12 animate-pulse rounded-lg bg-(--color-bg-tertiary)" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
