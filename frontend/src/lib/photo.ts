/**
 * 국회 사이트 이미지 URL을 프록시 URL로 변환합니다.
 * assembly.go.kr은 Referer 헤더 없이 요청하면 400을 반환하므로
 * 우리 API를 통해 프록시합니다.
 */
export function proxyPhotoUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!url.includes("assembly.go.kr")) return url;
  return `/api/photo?url=${encodeURIComponent(url)}`;
}

/** 프록시 URL인지 확인 (Next.js Image unoptimized 필요) */
export function isProxiedUrl(url: string): boolean {
  return url.startsWith("/api/photo");
}
