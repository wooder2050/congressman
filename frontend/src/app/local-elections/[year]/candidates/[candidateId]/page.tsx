import type { Metadata } from "next";
import { getLocalElectionCandidate } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import LocalCandidateDetailInner from "@/components/local-elections/LocalCandidateDetailInner";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 2592000; // 30d — 개표 종료(6/4) 후 DB 무변경(최종 2026-06-06). 봇 재크롤링마다 재생성돼 ISR Write가 과다해 상향
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ year: string; candidateId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, candidateId } = await params;
  const candidate = await getLocalElectionCandidate({
    id: `local-${year}`,
    candidateId: parseInt(candidateId, 10),
  });

  if (!candidate) return { title: "후보자 정보 없음" };

  const partyName = candidate.party?.name ?? "무소속";
  const description = `${candidate.race.displayName} ${partyName} ${candidate.name} 후보 — 경력·학력·공약·재산·병역 등 후보자 정보를 확인하세요.`;
  // 경력·공약이 모두 비어 있으면 thin content → 색인 제외
  const isThin = !candidate.career && candidate.pledges.length === 0;

  return {
    title: `${candidate.name} (${partyName}) — ${candidate.race.displayName} 후보`,
    description,
    robots: isThin ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/candidates/${candidateId}`,
    },
  };
}

export default async function LocalCandidateDetailPage({ params }: Props) {
  const { year, candidateId } = await params;
  const numericId = parseInt(candidateId, 10);
  const candidate = await getLocalElectionCandidate({
    id: `local-${year}`,
    candidateId: numericId,
  });

  const breadcrumbItems: { name: string; item: string }[] = [
    { name: "홈", item: "https://www.lawmake.kr" },
    { name: "지방선거", item: `https://www.lawmake.kr/local-elections/${year}` },
  ];
  if (candidate?.race) {
    breadcrumbItems.push({
      name: candidate.race.displayName,
      item: `https://www.lawmake.kr/local-elections/${year}/races/${candidate.race.id}`,
    });
  }
  breadcrumbItems.push({
    name: candidate?.name ?? "후보자",
    item: `https://www.lawmake.kr/local-elections/${year}/candidates/${candidateId}`,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
      {candidate && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: candidate.name,
            ...(candidate.party ? { affiliation: candidate.party.name } : {}),
          }}
        />
      )}

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <LocalCandidateDetailInner electionId={`local-${year}`} candidateId={numericId} />
      </CongressWrapper>
    </div>
  );
}
