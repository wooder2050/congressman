import type { Metadata } from "next";
import { getLocalElection } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import LocalResultsHub from "@/components/local-elections/LocalResultsHub";
import JsonLd from "@/components/seo/JsonLd";

// 개표 갱신 유지 + Vercel 정적 박제 방지(누락 시 옛 결과 박제 — PR #446 이력). 다른 개표 라우트와 동일.
export const revalidate = 1800; // 30min
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
  const name = election?.name ?? `${year} 지방선거`;
  const description = `${name} 개표 현황을 한곳에서. 시도지사·기초단체장과 국회의원 재보궐선거의 실시간 득표·투표율·출구조사·당선 유력 추정을 모아 봅니다.`;

  return {
    title: `${name} 개표 현황 — 실시간 종합`,
    description,
    alternates: { canonical: `https://www.lawmake.kr/local-elections/${year}/results` },
    openGraph: {
      title: `${name} 개표 현황 — 실시간 종합`,
      description,
      type: "website",
      url: `https://www.lawmake.kr/local-elections/${year}/results`,
    },
    twitter: { card: "summary", title: `${name} 개표 현황`, description },
  };
}

export default async function LocalElectionResultsPage({ params }: Props) {
  const { year } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
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
              name: "개표 현황",
              item: `https://www.lawmake.kr/local-elections/${year}/results`,
            },
          ],
        }}
      />

      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-(--color-text-primary)">개표 현황 종합</h1>
        <p className="text-sm text-(--color-text-secondary)">
          시도지사·기초단체장과 국회의원 재보궐선거 개표를 한곳에서 — 투표율·출구조사·당선 유력 추정
          포함
        </p>
      </header>

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <LocalResultsHub year={year} />
      </CongressWrapper>
    </div>
  );
}
