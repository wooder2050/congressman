import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import TodayBriefing from "@/components/today/TodayBriefing";

export const metadata: Metadata = {
  title: "오늘의 국회 — 3분 브리핑",
  description:
    "오늘 국회에서 무슨 일이 있었는지 3분 안에 파악하세요. 본회의·위원회 일정, 최근 표결 결과, 발의 법안을 한눈에 확인합니다.",
  alternates: { canonical: "https://www.lawmake.kr/today" },
  openGraph: {
    title: "오늘의 국회 — 3분 브리핑",
    description:
      "오늘 국회에서 무슨 일이 있었는지 3분 안에 파악하세요. 본회의·위원회 일정, 최근 표결 결과, 발의 법안을 한눈에 확인합니다.",
    url: "https://www.lawmake.kr/today",
  },
};

export default function TodayPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold">오늘의 국회</h1>
        <p className="text-sm text-(--color-text-secondary)">
          오늘 국회에서 무슨 일이 있었는지 3분 안에 파악하세요.
        </p>
      </div>
      <CongressWrapper fallback={<TodayBriefingSkeleton />}>
        <TodayBriefing termId={22} />
      </CongressWrapper>
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
