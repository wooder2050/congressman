import type { Metadata } from "next";
import { getElection } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import ElectionPageInner from "@/components/elections/ElectionPageInner";
import ElectionSkeleton from "@/components/elections/ElectionSkeleton";
import JsonLd from "@/components/seo/JsonLd";

interface ElectionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ElectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const election = await getElection(id);
  if (!election) return { title: "선거 정보 없음" };

  const description = `${election.name} — ${election.districts.length}개 선거구 재보궐선거 정보. 선거구별 공석 사유, 후보자 경력·공약·재산을 한눈에 비교하세요.`;

  return {
    title: `${election.name} — 선거구·후보 한눈에 보기`,
    description,
    alternates: { canonical: `https://www.lawmake.kr/elections/${id}` },
    openGraph: {
      title: `${election.name} 재보궐선거 종합 정보`,
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
              name: "재보궐선거",
              item: `https://www.lawmake.kr/elections/${id}`,
            },
          ],
        }}
      />

      <CongressWrapper fallback={<ElectionSkeleton />}>
        <ElectionPageInner electionId={id} />
      </CongressWrapper>
    </div>
  );
}
