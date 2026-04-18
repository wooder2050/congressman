import { getAllWeeklyArticles } from "@/data/weekly";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BASE = "https://www.lawmake.kr";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = getAllWeeklyArticles();

  const items = articles.slice(0, 20).map((article) => {
    const url = `${BASE}/weekly/${article.id}`;
    const headlines = [
      ...article.featuredBills.map((b) => b.title),
      ...article.highlights.map((h) => h.title),
    ];
    const description = article.summary + " — " + headlines.slice(0, 3).join(", ");

    return `    <item>
      <title>${escapeXml(`${article.title} 주간 국회 뉴스`)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(article.publishedDate).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>lawmake — 주간 국회 뉴스</title>
    <link>${BASE}/weekly</link>
    <description>매주 국회에서 일어난 주요 법안, 표결, 위원회 활동을 정리합니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
