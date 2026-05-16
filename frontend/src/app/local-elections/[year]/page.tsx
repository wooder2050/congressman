import type { Metadata } from "next";
import { getLocalElection } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionLanding from "@/components/local-elections/LocalElectionLanding";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 600; // 10min (개표일 빠른 갱신 필요)
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  const election = await getLocalElection(`local-${year}`);
  if (!election) return { title: "지방선거 정보 없음" };

  const description = `${year}년 ${election.name} 정보를 한곳에서 확인하세요. 광역단체장·기초단체장·교육감·광역의원·기초의원 후보자 경력·공약, 투표 일정·안내를 제공합니다.`;

  return {
    title: `${election.name} — 후보자·선거구·투표 안내`,
    description,
    alternates: { canonical: `https://www.lawmake.kr/local-elections/${year}` },
    openGraph: {
      title: `${election.name} — 후보자·선거구·투표 안내`,
      description,
      type: "website",
      url: `https://www.lawmake.kr/local-elections/${year}`,
    },
    twitter: { card: "summary", title: election.name, description },
  };
}

export default async function LocalElectionPage({ params }: Props) {
  const { year } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "홈",
              item: "https://www.lawmake.kr",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "지방선거",
              item: `https://www.lawmake.kr/local-elections/${year}`,
            },
          ],
        }}
      />

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <LocalElectionLanding year={year} />
      </CongressWrapper>
    </div>
  );
}
