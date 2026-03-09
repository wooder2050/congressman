import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import PageIntro from "@/components/ui/page-intro";
import WeeklyList from "@/components/weekly/WeeklyList";
import { getAllWeeklyArticles } from "@/data/weekly";

export const metadata: Metadata = {
  title: "주간 국회 뉴스",
  description:
    "매주 국회에서 있었던 주요 법안, 표결, 위원회 활동을 한눈에 정리합니다. 화제의 법안과 의정활동 하이라이트를 확인하세요.",
};

export default function WeeklyPage() {
  const articles = getAllWeeklyArticles();

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
              name: "주간 국회 뉴스",
              item: "https://www.lawmake.kr/weekly",
            },
          ],
        }}
      />

      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">주간 국회 뉴스</h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          매주 국회에서 있었던 주요 활동을 정리합니다. 화제의 법안, 본회의 표결, 위원회 심사 등
          한 주간의 의정활동 하이라이트를 확인하세요.
        </p>
      </section>

      <PageIntro
        description="주간 국회 뉴스는 국회 공공데이터와 언론 보도를 바탕으로 한 주간의 주요 의정활동을 요약합니다."
        details={[
          "주목할 만한 법안과 그 배경을 자세히 소개합니다",
          "본회의 표결 결과와 위원회 활동을 정리합니다",
          "관련 뉴스 출처를 함께 제공합니다",
        ]}
      />

      <WeeklyList articles={articles} />
    </div>
  );
}
