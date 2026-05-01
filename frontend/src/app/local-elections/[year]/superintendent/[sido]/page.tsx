import type { Metadata } from "next";
import { getLocalElectionRaces } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import RaceDetailInner from "@/components/local-elections/RaceDetailInner";
import JsonLd from "@/components/seo/JsonLd";
import { sidoToShort } from "@/constants/local-elections";

interface Props {
  params: Promise<{ year: string; sido: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, sido: rawSido } = await params;
  const sido = decodeURIComponent(rawSido);
  const short = sidoToShort(sido);

  return {
    title: `${short} 교육감 선거 — ${year} 지방선거`,
    description: `${year}년 ${sido} 교육감 후보자 정보를 확인하세요.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/superintendent/${encodeURIComponent(sido)}`,
    },
  };
}

export default async function SuperintendentSidoPage({ params }: Props) {
  const { year, sido: rawSido } = await params;
  const sido = decodeURIComponent(rawSido);
  const electionId = `local-${year}`;

  const data = await getLocalElectionRaces({
    id: electionId,
    type: "superintendent",
    sido,
    limit: 1,
  });

  const raceId = data?.races?.[0]?.id;

  if (!raceId) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center text-(--color-text-tertiary)">
        해당 시도의 교육감 선거 정보가 없습니다.
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
              name: "교육감",
              item: `https://www.lawmake.kr/local-elections/${year}/superintendent`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: sidoToShort(sido),
              item: `https://www.lawmake.kr/local-elections/${year}/superintendent/${encodeURIComponent(sido)}`,
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
