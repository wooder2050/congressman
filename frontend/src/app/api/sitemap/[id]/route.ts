import { NextRequest } from "next/server";
import { getBillIds, getVoteIds } from "@/lib/api";
import { BASE, BILLS_PER_SITEMAP, xmlResponse, urlEntry, urlset } from "../route";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function buildSitemap(id: number) {
  // Sitemap 0: static pages + members
  if (id === 0) {
    const entries = [
      urlEntry(BASE, { changefreq: "daily", priority: 1.0 }),
      urlEntry(`${BASE}/members`, { changefreq: "weekly", priority: 0.9 }),
      urlEntry(`${BASE}/bills`, { changefreq: "daily", priority: 0.8 }),
      urlEntry(`${BASE}/votes`, { changefreq: "daily", priority: 0.8 }),
      urlEntry(`${BASE}/schedule`, { changefreq: "daily", priority: 0.7 }),
      urlEntry(`${BASE}/map`, { changefreq: "monthly", priority: 0.6 }),
      urlEntry(`${BASE}/compare`, { changefreq: "monthly", priority: 0.5 }),
      urlEntry(`${BASE}/committees`, { changefreq: "weekly", priority: 0.7 }),
      urlEntry(`${BASE}/guide`, { changefreq: "monthly", priority: 0.6 }),
      urlEntry(`${BASE}/glossary`, { changefreq: "monthly", priority: 0.5 }),
    ];

    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/members?termId=22`);
        if (res.ok) {
          const members: { id: string }[] = await res.json();
          for (const m of members) {
            entries.push(
              urlEntry(`${BASE}/members/${m.id}`, { changefreq: "weekly", priority: 0.7 }),
            );
          }
        }
      } catch {
        // API fail — return static pages only
      }
    }

    return urlset(entries);
  }

  if (!API_BASE) return urlset([]);

  try {
    const [billIds, voteIds] = await Promise.all([getBillIds(), getVoteIds()]);
    const billSitemapCount = Math.ceil(billIds.length / BILLS_PER_SITEMAP);

    // Bill sitemaps: id 1 ~ billSitemapCount
    if (id >= 1 && id <= billSitemapCount) {
      const start = (id - 1) * BILLS_PER_SITEMAP;
      const slice = billIds.slice(start, start + BILLS_PER_SITEMAP);
      const entries = slice.map((b) =>
        urlEntry(`${BASE}/bills/${b.id}`, {
          lastmod: b.proposedDate || undefined,
          changefreq: "monthly",
          priority: 0.5,
        }),
      );
      return urlset(entries);
    }

    // Vote sitemap: id = billSitemapCount + 1
    if (id === billSitemapCount + 1) {
      const entries = voteIds.map((v) =>
        urlEntry(`${BASE}/votes/${v.id}`, {
          lastmod: v.procDate || undefined,
          changefreq: "monthly",
          priority: 0.5,
        }),
      );
      return urlset(entries);
    }
  } catch {
    // API fail
  }

  return urlset([]);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id) || id < 0) {
    return new Response("Invalid sitemap id", { status: 400 });
  }

  const xml = await buildSitemap(id);
  return xmlResponse(xml);
}
