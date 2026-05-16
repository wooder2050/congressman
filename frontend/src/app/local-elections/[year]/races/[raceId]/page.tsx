import type { Metadata } from "next";
import { getLocalElectionRace } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import RaceDetailInner from "@/components/local-elections/RaceDetailInner";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 60; // 60s — 개표일 race 단위 갱신 (다른 지방선거 페이지는 600s)
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

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
  const race = await getLocalElectionRace({
    id: `local-${year}`,
    raceId: parseInt(raceId, 10),
  });

  // BreadcrumbList: 홈 → 지방선거 → 시도(있으면) → 선거구
  const breadcrumbItems: { name: string; item: string }[] = [
    { name: "홈", item: "https://www.lawmake.kr" },
    { name: "지방선거", item: `https://www.lawmake.kr/local-elections/${year}` },
  ];
  if (race?.sido) {
    breadcrumbItems.push({
      name: race.sido,
      item: `https://www.lawmake.kr/local-elections/${year}/regions/${encodeURIComponent(race.sido)}`,
    });
  }
  breadcrumbItems.push({
    name: race?.displayName ?? "선거구",
    item: `https://www.lawmake.kr/local-elections/${year}/races/${raceId}`,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems.map((b, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: b.name,
            item: b.item,
          })),
        }}
      />

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceDetailInner electionId={`local-${year}`} raceId={parseInt(raceId, 10)} />
      </CongressWrapper>
    </div>
  );
}
