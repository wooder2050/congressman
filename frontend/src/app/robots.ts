import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Bingbot", "Yeti", "Daumoa"],
        allow: ["/_next/static/", "/"],
        disallow: ["/api/", "/_next/data/"],
      },
      {
        userAgent: "*",
        allow: ["/_next/static/", "/"],
        disallow: ["/api/", "/_next/data/"],
      },
    ],
    sitemap: "https://www.lawmake.kr/sitemap.xml",
  };
}
