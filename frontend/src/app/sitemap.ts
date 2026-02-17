import type { MetadataRoute } from "next";

const BASE = "https://www.lawmake.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/members`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/bills`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/votes`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/schedule`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/map`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/compare`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return staticPages;

  let memberUrls: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${apiBase}/api/members?termId=22`);
    if (res.ok) {
      const members: { id: string }[] = await res.json();
      memberUrls = members.map((m) => ({
        url: `${BASE}/members/${m.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // API 실패 시 정적 페이지만 반환
  }

  return [...staticPages, ...memberUrls];
}
