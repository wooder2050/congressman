import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import JsonLd from "@/components/seo/JsonLd";
import CongressWrapper from "@/common/CongressWrapper";
import RegionalElectionInner from "@/components/elections/RegionalElectionInner";

const REGION_NAMES: Record<string, string> = {
  서울: "서울특별시",
  부산: "부산광역시",
  대구: "대구광역시",
  인천: "인천광역시",
  광주: "광주광역시",
  대전: "대전광역시",
  울산: "울산광역시",
  세종: "세종특별자치시",
  경기: "경기도",
  강원: "강원특별자치도",
  충북: "충청북도",
  충남: "충청남도",
  전북: "전북특별자치도",
  전남: "전라남도",
  경북: "경상북도",
  경남: "경상남도",
  제주: "제주특별자치도",
};

interface RegionalPageProps {
  params: Promise<{ id: string; sido: string }>;
}

export async function generateMetadata({ params }: RegionalPageProps): Promise<Metadata> {
  const { sido } = await params;
  const regionName = REGION_NAMES[decodeURIComponent(sido)] ?? decodeURIComponent(sido);

  return {
    title: `${regionName} 6·3 선거 정보 — 재보궐·투표 안내`,
    description: `${regionName}의 6·3 지방선거 정보입니다. ${regionName} 재보궐 선거구, 후보자 정보, 투표 일정·투표소 안내를 제공합니다.`,
    alternates: {
      canonical: `https://www.lawmake.kr/elections/2026-06-03/regions/${encodeURIComponent(decodeURIComponent(sido))}`,
    },
  };
}

export default async function RegionalElectionPage({ params }: RegionalPageProps) {
  const { id, sido } = await params;
  const decodedSido = decodeURIComponent(sido);
  const regionName = REGION_NAMES[decodedSido] ?? decodedSido;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "6·3 선거", href: `/elections/${id}` },
          { name: "지역별", href: `/elections/${id}/regions` },
          { name: regionName, href: `/elections/${id}/regions/${encodeURIComponent(decodedSido)}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: `${regionName}에서 재보궐선거가 있나요?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${regionName}의 재보궐 선거구 현황은 이 페이지에서 확인할 수 있습니다. 6·3 지방선거와 동시에 실시됩니다.`,
              },
            },
            {
              "@type": "Question",
              name: `${regionName} 투표소는 어디서 찾나요?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: "중앙선거관리위원회 홈페이지(nec.go.kr)에서 주소지 기반 투표소를 검색할 수 있습니다.",
              },
            },
          ],
        }}
      />

      {/* 헤더 */}
      <section>
        <p className="text-sm font-medium text-(--color-primary)">
          <Link href={`/elections/${id}/regions`} className="hover:underline">
            ← 지역별 선거
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{regionName} 선거 정보</h1>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          {regionName}의 6·3 지방선거 정보입니다. 재보궐 선거구, 후보자 정보, 투표 일정을
          확인하세요.
        </p>
      </section>

      {/* 재보궐 선거구 */}
      <CongressWrapper
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-tertiary)"
              />
            ))}
          </div>
        }
      >
        <RegionalElectionInner electionId={id} region={decodedSido} />
      </CongressWrapper>

      {/* 투표 안내 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">투표 안내</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
            <p className="text-xs font-semibold text-(--color-text-tertiary)">사전투표</p>
            <p className="mt-1 text-lg font-bold">5/29(금)~30(토)</p>
            <p className="mt-1 text-xs text-(--color-text-secondary)">
              전국 어디서나 · 06:00~18:00
            </p>
          </div>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
            <p className="text-xs font-semibold text-(--color-text-tertiary)">본투표</p>
            <p className="mt-1 text-lg font-bold">6/3(수)</p>
            <p className="mt-1 text-xs text-(--color-text-secondary)">
              주소지 관할 투표소 · 06:00~18:00
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/elections/${id}/vote`}
            className="flex-1 rounded-xl border border-(--color-primary) bg-blue-50 py-3 text-center text-sm font-semibold text-(--color-primary) transition-colors hover:bg-blue-100"
          >
            투표 안내 자세히 보기
          </Link>
          <a
            href="https://www.nec.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-(--color-primary) py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-(--color-primary-hover)"
          >
            투표소 찾기
          </a>
        </div>
      </section>
    </div>
  );
}
