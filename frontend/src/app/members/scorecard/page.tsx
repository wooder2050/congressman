import type { Metadata } from "next";
import Link from "next/link";
import CongressWrapper from "@/common/CongressWrapper";
import ScorecardRankingClient from "./ScorecardRankingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "국회의원 의정활동 성적표 — 종합 랭킹",
  description:
    "22대 국회의원 295명의 의정활동을 출석률, 표결 참여율, 법안 발의, 법안 통과율로 종합 평가한 성적표 랭킹입니다. S~D 등급별, 정당별로 비교할 수 있습니다.",
  alternates: { canonical: "https://www.lawmake.kr/members/scorecard" },
};

export default function ScorecardRankingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 의원 목록으로
      </Link>

      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">의정활동 성적표</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          출석률(30점) + 표결 참여율(25점) + 법안 발의(25점) + 법안 통과율(20점) = 100점 만점
        </p>
      </section>

      <CongressWrapper fallback={null}>
        <ScorecardRankingClient />
      </CongressWrapper>
    </div>
  );
}
