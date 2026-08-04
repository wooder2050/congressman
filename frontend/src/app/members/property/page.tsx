import type { Metadata } from "next";
import Link from "next/link";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import PropertyPageClient from "./PropertyPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "국회의원 부동산 보유 현황 — 다주택자·고가주택·재산 순위",
  description:
    "22대 국회의원 중 다주택자는 몇 명? 부동산 보유 현황을 2025년 말 기준 재산신고 공개자료로 분석합니다. 다주택 의원, 15억 이상 고가주택 보유자, 부동산 총액 30억 이상 의원을 정당별·위원회별로 확인하세요.",
  alternates: { canonical: "https://www.lawmake.kr/members/property" },
};

export default function PropertyPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 의원 목록
      </Link>

      <div className="space-y-3">
        <h1 className="text-2xl font-bold">국회의원 부동산 보유 현황</h1>
        <PageIntro
          description="2025년 12월 31일 기준 재산신고 공개자료(2026년 3월 공개)를 기반으로 22대 국회의원의 부동산 보유 현황을 분류했습니다. 대통령이 행정부에 지시한 부동산 관련 인사 기준(다주택자·고가주택·부동산 과다보유)을 국회의원에 참고 적용한 것입니다."
          details={[
            "다주택자: 본인·배우자 명의 주거용 건물 2채 이상 소유 (전세·임차권·분양권 제외)",
            "고가주택: 단일 주택 신고가액 15억원 이상",
            "부동산 과다보유: 본인·배우자 명의 부동산(건물+토지) 총 신고액 30억원 이상",
            "한 의원이 여러 분류에 중복 해당될 수 있습니다.",
            "재산신고 가액은 공시가격 기준이며 시세와 다를 수 있습니다.",
          ]}
        />
      </div>

      <CongressWrapper
        fallback={
          <div className="flex h-96 items-center justify-center">
            <span className="text-sm text-(--color-text-tertiary)">불러오는 중...</span>
          </div>
        }
      >
        <PropertyPageClient />
      </CongressWrapper>
    </div>
  );
}
