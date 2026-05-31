import type { MetadataRoute } from "next";

// AI 스크래퍼/대량 크롤러 — SEO 가치 없이 ISR 재생성·Origin Transfer 비용만 유발하므로 전면 차단.
const BLOCKED_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "PerplexityBot",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "FacebookBot",
  "DataForSeoBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // SEO 검색엔진 — 정상 인덱싱 허용
      {
        userAgent: ["Googlebot", "Bingbot", "Yeti", "Daumoa"],
        allow: ["/_next/static/", "/"],
        disallow: ["/api/", "/_next/data/"],
      },
      // AI 스크래퍼·대량 크롤러 — 전면 차단
      {
        userAgent: BLOCKED_BOTS,
        disallow: ["/"],
      },
      // 그 외 봇 — 기본 허용하되 API/data는 차단
      {
        userAgent: "*",
        allow: ["/_next/static/", "/"],
        disallow: ["/api/", "/_next/data/"],
      },
    ],
    sitemap: "https://www.lawmake.kr/sitemap.xml",
  };
}
