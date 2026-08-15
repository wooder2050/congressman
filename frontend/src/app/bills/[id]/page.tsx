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

// 14d — 법안은 발의 후 내용이 거의 바뀌지 않는다.
// 2d일 때 Observability상 읽기 44회 대비 쓰기 1.5K(12시간 기준)로 재생성이 압도적이었다.
// 봇이 크롤링 → 페이지 생성(ISR Write + Origin Transfer) → 아무도 읽지 않고 만료 → 재크롤링이
// 반복되며 비용 대부분을 차지했다.
// 주의: daily sync의 캐시 무효화는 Upstash(백엔드 API 캐시)만 지운다. Next ISR 캐시는
// 여기 주기를 따르므로, 새로 생성한 AI 요약이 상세 페이지에 뜨기까지 최대 14일이 걸린다.
export const revalidate = 1209600;
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

  // 색인 기준 = sitemap(getIndexableBillIds v3.1)과 동일:
  // AI 요약(simpleSummary) 보유 + 본회의 처리 결과 도달 + 표결 레코드 실존.
  // 본회의 표결 도달 법안에는 의원별 찬반·정당별 집계 등 원본(열린국회정보)에
  // 조립된 형태로 없는 데이터가 붙는다. 위원회 단계까지의 법안은 필드 나열 +
  // 자동 요약뿐이라 색인 제외(2026-08, AdSense "고유 콘텐츠" 기준 대응).
  // hasVote까지 요구하는 이유: 무기명 재표결 등은 lawResult가 있어도 의원별
  // 표결 데이터가 없어 "고유 데이터" 논리가 성립하지 않는다(codex 리뷰 반영).
  const isIndexable = !!bill.simpleSummary && !!bill.progress?.lawResult && !!bill.hasVote;

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
