import { getIndexableBillIds, getVoteIds } from "@/lib/api";

export const revalidate = 86400;

export const BASE = "https://www.lawmake.kr";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
export const BILLS_PER_SITEMAP = 10_000;

export function xmlResponse(xml: string) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

export function urlEntry(
  url: string,
  opts?: { lastmod?: string; changefreq?: string; priority?: number },
) {
  // lastmod는 실제 변경일을 아는 경우에만 넣는다.
  //
  // 예전에는 명시가 없으면 오늘 날짜를 채웠는데, sitemap이 revalidate=86400이라
  // 내용이 그대로인 URL도 매일 lastmod가 새 날짜로 회전했다. 검색엔진에는 "매일 바뀐다"는
  // 잘못된 신호가 되어 불필요한 재크롤을 유발하고(ISR Write·Origin Transfer 비용),
  // 정작 진짜 변경 시점은 구분할 수 없게 된다.
  // 값이 없으면 lastmod를 생략하는 편이 낫다 — 사이트맵 규격상 선택 항목이다.
  let entry = `  <url>\n    <loc>${url}</loc>`;
  if (opts?.lastmod) entry += `\n    <lastmod>${opts.lastmod}</lastmod>`;
  if (opts?.changefreq) entry += `\n    <changefreq>${opts.changefreq}</changefreq>`;
  if (opts?.priority !== undefined) entry += `\n    <priority>${opts.priority}</priority>`;
  entry += `\n  </url>`;
  return entry;
}

export function urlset(entries: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

async function getSitemapCount() {
  if (!API_BASE) return { billSitemapCount: 0, hasVotes: false };
  try {
    const [billIds, voteIds] = await Promise.all([getIndexableBillIds(), getVoteIds()]);
    return {
      billSitemapCount: Math.ceil(billIds.length / BILLS_PER_SITEMAP),
      hasVotes: voteIds.length > 0,
    };
  } catch {
    return { billSitemapCount: 0, hasVotes: false };
  }
}

export async function GET() {
  const { billSitemapCount, hasVotes } = await getSitemapCount();
  // id 0: static + members, id 1~N: bills, id N+1: votes
  const ids = [];
  for (let i = 0; i <= billSitemapCount; i++) ids.push(i);
  if (hasVotes) ids.push(billSitemapCount + 1);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ids.map((id) => `  <sitemap><loc>${BASE}/sitemap/${id}.xml</loc></sitemap>`).join("\n")}
</sitemapindex>`;

  return xmlResponse(xml);
}
