import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionBreadcrumb from "@/components/local-elections/LocalElectionBreadcrumb";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import LocalProportionalNotice from "@/components/local-elections/LocalProportionalNotice";
import RaceListInner from "@/components/local-elections/RaceListInner";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} 기초의원 비례대표 — NEC Open API 미제공 안내`,
    description: `${year}년 전국동시지방선거 기초의원 비례대표 후보자 명부는 중앙선관위 공공데이터 OpenAPI에서 제공되지 않습니다. NEC 선거통계시스템·선거공보 도서관 등 공식 채널 안내를 확인하세요.`,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/local-proportional`,
    },
  };
}

export default async function LocalProportionalListPage({ params }: Props) {
  const { year } = await params;

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
              name: "기초의원 비례",
              item: `https://www.lawmake.kr/local-elections/${year}/local-proportional`,
            },
          ],
        }}
      />

      <LocalElectionBreadcrumb
        items={[
          { label: "제9회 전국동시지방선거", href: `/local-elections/${year}` },
          { label: "기초의원 비례" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">기초의원 비례대표</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          정당투표로 선출하는 시·군·구의회 비례대표 후보자입니다. NEC가 데이터를 제공하지 않더라도
          선거 자체는 6/3에 정상 시행됩니다.
        </p>
      </div>

      <LocalProportionalNotice />

      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <RaceListInner year={year} electionId={`local-${year}`} initialType="local-proportional" />
      </CongressWrapper>
    </div>
  );
}
