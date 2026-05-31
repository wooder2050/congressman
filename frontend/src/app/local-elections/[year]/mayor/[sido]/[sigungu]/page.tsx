import type { Metadata } from "next";
import { getLocalElectionRaces } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import RaceDetailInner from "@/components/local-elections/RaceDetailInner";
import JsonLd from "@/components/seo/JsonLd";
import { sidoToShort } from "@/constants/local-elections";

export const revalidate = 1800; // 30min (ISR Write 절감, 6/3 개표 갱신 유지)
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ year: string; sido: string; sigungu: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, sido: rawSido, sigungu: rawSigungu } = await params;
  const sido = decodeURIComponent(rawSido);
  const sigungu = decodeURIComponent(rawSigungu);

  return {
    title: `${sigungu} 기초단체장 선거 — ${year} 지방선거`,
    description: `${year}년 ${sido} ${sigungu} 기초단체장 후보자 정보를 확인하세요.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/mayor/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}`,
    },
  };
}

export default async function MayorSigunguPage({ params }: Props) {
  const { year, sido: rawSido, sigungu: rawSigungu } = await params;
  const sido = decodeURIComponent(rawSido);
  const sigungu = decodeURIComponent(rawSigungu);
  const short = sidoToShort(sido);
  const electionId = `local-${year}`;

  const data = await getLocalElectionRaces({
    id: electionId,
    type: "mayor",
    sido,
    sigungu,
    limit: 1,
  });

  const raceId = data?.races?.[0]?.id;

  if (!raceId) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center text-(--color-text-tertiary)">
        해당 시군구의 기초단체장 선거 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: "https://www.lawmake.kr" },
            {
              "@type": "ListItem",
              position: 2,
              name: "지방선거",
              item: `https://www.lawmake.kr/local-elections/${year}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "기초단체장",
              item: `https://www.lawmake.kr/local-elections/${year}/mayor`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: short,
              item: `https://www.lawmake.kr/local-elections/${year}/mayor/${encodeURIComponent(sido)}`,
            },
            {
              "@type": "ListItem",
              position: 5,
              name: sigungu,
              item: `https://www.lawmake.kr/local-elections/${year}/mayor/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}`,
            },
          ],
        }}
      />

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceDetailInner electionId={electionId} raceId={raceId} />
      </CongressWrapper>
    </div>
  );
}
