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

// og:image·twitter:image로 노출하는 공유 카드 생성 경로. /api/ 아래에 있지만 크롤러가
// 가져갈 수 있어야 검색 결과 썸네일·SNS 미리보기가 정상 동작한다. 막아두면 구글이
// "색인이 생성되었으나 robots.txt에 의해 차단됨"으로 URL만 색인한다(2026-09-16 GSC 알림).
const SHARE_IMAGE_PATH = "/api/share/";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // SEO 검색엔진 — 정상 인덱싱 허용
      {
        userAgent: ["Googlebot", "Bingbot", "Yeti", "Daumoa"],
        allow: ["/_next/static/", SHARE_IMAGE_PATH, "/"],
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
        allow: ["/_next/static/", SHARE_IMAGE_PATH, "/"],
        disallow: ["/api/", "/_next/data/"],
      },
    ],
    sitemap: "https://www.lawmake.kr/sitemap.xml",
  };
}
