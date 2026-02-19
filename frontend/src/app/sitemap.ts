import type { MetadataRoute } from "next";
import { getBillIds, getVoteIds } from "@/lib/api";

const BASE = "https://www.lawmake.kr";
const BILLS_PER_SITEMAP = 10_000;

export async function generateSitemaps() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return [{ id: 0 }];

  try {
    const [billIds, voteIds] = await Promise.all([getBillIds(), getVoteIds()]);
    const billSitemapCount = Math.ceil(billIds.length / BILLS_PER_SITEMAP);
    // id 0: static + members, id 1~N: bills, id N+1: votes
    const ids = [];
    for (let i = 0; i <= billSitemapCount; i++) {
      ids.push({ id: i });
    }
    if (voteIds.length > 0) {
      ids.push({ id: billSitemapCount + 1 });
    }
    return ids;
  } catch {
    return [{ id: 0 }];
  }
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // Sitemap 0: static pages + members
  if (id === 0) {
    const staticPages: MetadataRoute.Sitemap = [
      { url: BASE, changeFrequency: "daily", priority: 1.0 },
      { url: `${BASE}/members`, changeFrequency: "weekly", priority: 0.9 },
      { url: `${BASE}/bills`, changeFrequency: "daily", priority: 0.8 },
      { url: `${BASE}/votes`, changeFrequency: "daily", priority: 0.8 },
      { url: `${BASE}/schedule`, changeFrequency: "daily", priority: 0.7 },
      { url: `${BASE}/map`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${BASE}/compare`, changeFrequency: "monthly", priority: 0.5 },
    ];

    if (!apiBase) return staticPages;

    try {
      const res = await fetch(`${apiBase}/api/members?termId=22`);
      if (res.ok) {
        const members: { id: string }[] = await res.json();
        const memberUrls = members.map((m) => ({
          url: `${BASE}/members/${m.id}`,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
        return [...staticPages, ...memberUrls];
      }
    } catch {
      // API fail
    }

    return staticPages;
  }

  if (!apiBase) return [];

  try {
    const [billIds, voteIds] = await Promise.all([getBillIds(), getVoteIds()]);
    const billSitemapCount = Math.ceil(billIds.length / BILLS_PER_SITEMAP);

    // Bill sitemaps: id 1 ~ billSitemapCount
    if (id >= 1 && id <= billSitemapCount) {
      const start = (id - 1) * BILLS_PER_SITEMAP;
      const slice = billIds.slice(start, start + BILLS_PER_SITEMAP);
      return slice.map((b) => ({
        url: `${BASE}/bills/${b.id}`,
        lastModified: b.proposedDate || undefined,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
    }

    // Vote sitemap: id = billSitemapCount + 1
    if (id === billSitemapCount + 1) {
      return voteIds.map((v) => ({
        url: `${BASE}/votes/${v.id}`,
        lastModified: v.procDate || undefined,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
    }
  } catch {
    // API fail
  }

  return [];
}
