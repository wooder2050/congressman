import type { Metadata } from "next";
import { getLocalElectionRace } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import RaceDetailInner from "@/components/local-elections/RaceDetailInner";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ year: string; raceId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, raceId } = await params;
  const race = await getLocalElectionRace({
    id: `local-${year}`,
    raceId: parseInt(raceId, 10),
  });

  if (!race) return { title: "선거구 정보 없음" };

  const candidateNames = race.candidates
    .slice(0, 4)
    .map((c) => c.name)
    .join("·");
  const description = `${race.displayName} 후보자 ${race.candidates.length}명 비교: ${candidateNames}. 경력·공약·재산 정보를 확인하세요.`;
  const isEmpty = race.candidates.length === 0;

  return {
    title: `${race.displayName} — ${year} 지방선거 후보자 비교`,
    description,
    robots: isEmpty ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/races/${raceId}`,
    },
  };
}

export default async function RaceDetailPage({ params }: Props) {
  const { year, raceId } = await params;

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
              name: "선거구",
              item: `https://www.lawmake.kr/local-elections/${year}/races/${raceId}`,
            },
          ],
        }}
      />

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceDetailInner electionId={`local-${year}`} raceId={parseInt(raceId, 10)} />
      </CongressWrapper>
    </div>
  );
}
