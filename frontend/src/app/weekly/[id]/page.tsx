import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { getWeeklyArticle, getWeeklyArticleIds } from "@/data/weekly";
import WeeklyDetailContent from "@/components/weekly/WeeklyDetailContent";

interface WeeklyDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getWeeklyArticleIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: WeeklyDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = getWeeklyArticle(id);
  if (!article) return { title: "주간 뉴스를 찾을 수 없습니다" };

  return {
    title: `${article.title} 주간 국회 뉴스`,
    description: article.summary,
    openGraph: {
      title: `${article.title} 주간 국회 뉴스`,
      description: article.summary,
      type: "article",
      publishedTime: article.publishedDate,
    },
  };
}

export default async function WeeklyDetailPage({ params }: WeeklyDetailPageProps) {
  const { id } = await params;
  const article = getWeeklyArticle(id);
  if (!article) notFound();

  return (
    <>
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
            {
              "@type": "ListItem",
              position: 3,
              name: `${article.title}`,
              item: `https://www.lawmake.kr/weekly/${article.id}`,
            },
          ],
        }}
      />
      <WeeklyDetailContent article={article} />
    </>
  );
}
