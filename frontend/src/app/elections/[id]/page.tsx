import type { Metadata } from "next";
import { getElection } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import ElectionPageInner from "@/components/elections/ElectionPageInner";
import ElectionSkeleton from "@/components/elections/ElectionSkeleton";
import ElectionTrendWidget from "@/components/elections/ElectionTrendWidget";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 2592000; // 30d — 개표 종료(6/4) 후 데이터 확정. 봇 재크롤링마다 재생성돼 ISR Write가 과다해 상향

interface ElectionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ElectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const election = await getElection(id);
  if (!election) return { title: "선거 정보 없음" };

  const description = `2026년 6월 3일 국회의원 재보궐선거 ${election.districts.length}개 선거구를 한곳에서. 부산 북갑(한동훈·박민식·하정우)·평택을(김용남·조국·유의동 등 5파전) 핫스팟, 후보자 경력·공약·재산, 투표 일정과 사전투표(5/29~30)·본투표(6/3) 안내, 국회의원 출신 후보 성적표를 제공합니다.`;

  return {
    title: `${election.name} — 지방선거·재보궐 종합 정보`,
    description,
    alternates: { canonical: `https://www.lawmake.kr/elections/${id}` },
    openGraph: {
      title: `${election.name} — 지방선거·재보궐 종합 정보`,
      description,
      type: "website",
      url: `https://www.lawmake.kr/elections/${id}`,
    },
    twitter: { card: "summary", title: `${election.name}`, description },
  };
}

export default async function ElectionPage({ params }: ElectionPageProps) {
  const { id } = await params;

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
              name: "6·3 선거",
              item: `https://www.lawmake.kr/elections/${id}`,
            },
          ],
        }}
      />

      <ElectionTrendWidget />

      <CongressWrapper fallback={<ElectionSkeleton />}>
        <ElectionPageInner electionId={id} />
      </CongressWrapper>
    </div>
  );
}
