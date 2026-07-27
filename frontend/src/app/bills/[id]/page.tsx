import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBill } from "@/lib/api";
import { Suspense } from "react";
import BillDetailInner from "@/components/bills/BillDetailInner";
import RelatedBills from "@/components/bills/RelatedBills";
import BillJsonLd from "@/components/seo/BillJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { billDisplayTitle, truncateAtWord } from "@/lib/bill-title";
import { normalizeTopic } from "@/lib/constants";
import type { BillStructuredSummary } from "@/types";

export const revalidate = 172800; // 2d — 법안은 발의 후 거의 불변, 크롤링 재생성 절감 (AI 요약 반영 지연 최대 2일)
export const dynamicParams = true;

// 빈 배열을 반환해 첫 방문 시 ISR로 정적 생성되도록 한다.
// 1.5만 개 법안을 빌드 시점에 모두 생성하지 않고 on-demand로 처리.
export function generateStaticParams() {
  return [];
}

interface BillDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BillDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const bill = await getBill(id);
  if (!bill) return { title: "법안 정보 없음" };

  const statusText =
    bill.status === "passed"
      ? "가결"
      : bill.status === "discarded"
        ? "폐기"
        : bill.status === "committee"
          ? "위원회 심사 중"
          : "계류";
  const coSuffix = bill.coProposerCount > 0 ? ` 외 ${bill.coProposerCount}인 발의` : " 발의";

  // 제목 중복(색인 6,039개 중 고유 제목 1,701개뿐) 해소를 위해 요약 핵심구로 고유화한다.
  // 예: "친환경차 개소세 감면 4년 연장 (조세특례제한법) — 가결 | ㅇㅇㅇ 발의"
  // headlineMax를 짧게 줘 billDisplayTitle이 길이를 관리하도록 하고(괄호 깨짐 방지),
  // 여기서 재차 잘라 " (법이름" 처럼 괄호가 열린 채 끊기는 일을 막는다.
  const shortTitle = billDisplayTitle(bill.title, bill.simpleSummary, 34);
  const title = `${shortTitle} — ${statusText} | ${bill.proposerName}${coSuffix}`;

  // description도 요약 + 개정 핵심(structuredSummary.change)을 붙여 페이지마다 고유하게.
  const change = (bill.structuredSummary as BillStructuredSummary | null | undefined)?.change;
  const canonicalTopic = normalizeTopic(bill.topic);
  const descParts = [
    bill.simpleSummary || `${bill.title} (${statusText}).`,
    change && change !== bill.simpleSummary ? change : "",
    canonicalTopic ? `[${canonicalTopic}]` : "",
    `${bill.proposerName}${coSuffix}, ${bill.proposedDate}.`,
  ];
  const description = truncateAtWord(descParts.filter(Boolean).join(" "), 160);

  // 색인 기준 = sitemap(getIndexableBillIds)과 동일:
  // AI 요약(simpleSummary) 보유 + 실제 입법 과정(위원회 또는 본회의 처리 결과) 도달.
  // 제출만 된 계류·단순 발의 법안은 thin content이므로 색인 제외(2026-06 AdSense 대응).
  const reachedProcess = !!(bill.progress?.committeeResult || bill.progress?.lawResult);
  const isIndexable = !!bill.simpleSummary && reachedProcess;

  return {
    title,
    description,
    robots: !isIndexable ? { index: false, follow: true } : undefined,
    alternates: { canonical: `https://www.lawmake.kr/bills/${id}` },
    openGraph: {
      title,
      description,
      url: `https://www.lawmake.kr/bills/${id}`,
    },
    twitter: { card: "summary_large_image", title: shortTitle, description },
  };
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) notFound();

  return (
    <>
      <BillJsonLd id={id} />
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "법안 목록", href: "/bills" },
          { name: "법안 상세", href: `/bills/${id}` },
        ]}
      />
      <BillDetailInner bill={bill} />
      <div className="mx-auto mt-6 max-w-7xl">
        {/* 선택 섹션 — 지연·실패가 상세 본문 렌더링을 붙잡지 않도록 Suspense로 분리 */}
        <Suspense fallback={null}>
          <RelatedBills billId={id} />
        </Suspense>
      </div>
    </>
  );
}
