import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "국회의원·법안·표결 한눈에 비교 | lawmake";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  let fontData: ArrayBuffer | null = null;
  try {
    const fontRes = await fetch(
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Bold.woff",
    );
    if (fontRes.ok) fontData = await fontRes.arrayBuffer();
  } catch {
    // CDN 장애 시 시스템 폰트 폴백
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#111827",
        fontFamily: "Pretendard",
        position: "relative",
      }}
    >
      {/* 상단 악센트 바 */}
      <div
        style={{
          width: "100%",
          height: 8,
          display: "flex",
        }}
      >
        <div style={{ flex: 1, backgroundColor: "#2563EB", display: "flex" }} />
        <div style={{ flex: 1, backgroundColor: "#E11D48", display: "flex" }} />
        <div style={{ flex: 1, backgroundColor: "#F59E0B", display: "flex" }} />
        <div style={{ flex: 1, backgroundColor: "#10B981", display: "flex" }} />
      </div>

      {/* 메인 콘텐츠 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 80px",
          gap: 32,
        }}
      >
        {/* 국회 아이콘 */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            backgroundColor: "#1F2937",
            border: "3px solid #374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
          }}
        >
          🏛️
        </div>

        {/* 타이틀 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 700, color: "#ffffff" }}>
            국회의원·법안·표결 한눈에 비교
          </span>
          <span style={{ fontSize: 28, color: "#9CA3AF" }}>
            22대 296명 의정활동 · AI 법안 요약 · 선거구 지도
          </span>
        </div>

        {/* 하단 도메인 */}
        <span style={{ fontSize: 22, color: "#6B7280", marginTop: 16 }}>lawmake.kr</span>
      </div>
    </div>,
    {
      ...size,
      ...(fontData && {
        fonts: [
          {
            name: "Pretendard",
            data: fontData,
            style: "normal" as const,
            weight: 700 as const,
          },
        ],
      }),
    },
  );
}
