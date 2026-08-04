import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import PageIntro from "@/components/ui/page-intro";
import WeeklyList from "@/components/weekly/WeeklyList";
import { getAllWeeklyArticles } from "@/data/weekly";
import { EDITORS_PICKS } from "@/data/editors-picks";

export const metadata: Metadata = {
  title: "주간 국회 뉴스 - 이번 주 국회에서 무슨 일이?",
  description:
    "매주 국회에서 통과된 법안, 본회의 표결, 위원회 활동을 쉽게 정리합니다. 대미투자특별법, 임금체불 처벌 강화 등 시민 생활에 닿는 법안 소식을 해요체로 풀어드려요.",
  alternates: { canonical: "https://www.lawmake.kr/weekly" },
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "주간 국회 뉴스",
          description: "매주 국회에서 통과된 법안, 본회의 표결, 위원회 활동을 쉽게 정리합니다.",
          url: "https://www.lawmake.kr/weekly",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: articles.length,
            itemListElement: articles.slice(0, 10).map((article, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://www.lawmake.kr/weekly/${article.id}`,
              name: article.title,
            })),
          },
        }}
      />

      <section>
        <h1 className="text-2xl font-bold sm:text-3xl sm:font-extrabold sm:tracking-tight">
          주간 국회 뉴스
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          매주 국회에서 있었던 주요 활동을 정리합니다. 화제의 법안, 본회의 표결, 위원회 심사 등 한
          주간의 의정활동 하이라이트를 확인하세요.
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

      {/* 처음 읽을 10편 — 편집 선별 큐레이션 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">처음 읽는다면 이 10편부터</h2>
        <p className="text-sm text-(--color-text-tertiary)">
          지금 정국을 이해하는 데 필요한 기사를 편집팀이 순서대로 골랐습니다.
        </p>
        <ol className="space-y-2">
          {EDITORS_PICKS.map((pick, i) => (
            <li key={pick.href}>
              <Link
                href={pick.href}
                className="flex items-start gap-3 rounded-lg border border-(--color-border-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
              >
                <span className="mt-0.5 w-6 shrink-0 text-center text-sm font-bold text-(--color-primary)">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block leading-snug font-semibold text-(--color-text-primary)">
                    {pick.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-(--color-text-secondary)">
                    {pick.why}
                  </span>
                  <span className="mt-0.5 block text-xs text-(--color-text-tertiary)">
                    {pick.category} · {pick.date}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">전체 주간호</h2>
        <WeeklyList articles={articles} />
      </section>
    </div>
  );
}
