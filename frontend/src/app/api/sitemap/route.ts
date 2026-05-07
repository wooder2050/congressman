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
