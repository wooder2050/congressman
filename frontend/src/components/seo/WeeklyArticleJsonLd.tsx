import type { WeeklyArticle } from "@/data/weekly/types";
import JsonLd from "./JsonLd";

interface WeeklyArticleJsonLdProps {
  article: WeeklyArticle;
}

export default function WeeklyArticleJsonLd({ article }: WeeklyArticleJsonLdProps) {
  const url = `https://www.lawmake.kr/weekly/${article.id}`;

  const headlines = [
    ...article.featuredBills.map((b) => b.title),
    ...article.highlights.map((h) => h.title),
  ];
  const articleBody = headlines.join(" / ");

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: `${article.title} 주간 국회 뉴스`,
        datePublished: article.publishedDate,
        dateModified: article.publishedDate,
        author: {
          "@type": "Organization",
          name: "lawmake.kr",
          url: "https://www.lawmake.kr",
        },
        publisher: {
          "@type": "Organization",
          name: "lawmake.kr",
          url: "https://www.lawmake.kr",
        },
        description: article.summary,
        articleBody,
        mainEntityOfPage: url,
        image: `https://www.lawmake.kr/weekly/${article.id}/opengraph-image`,
        keywords: article.tags,
      }}
    />
  );
}
