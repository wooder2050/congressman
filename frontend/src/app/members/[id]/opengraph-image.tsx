import { ImageResponse } from "next/og";
import { getMember, getMemberTerms } from "@/lib/api";

export const runtime = "edge";
export const alt = "의원 프로필";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member, terms] = await Promise.all([getMember(id), getMemberTerms(id)]);

  if (!member) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a2e",
          color: "#ffffff",
          fontSize: 48,
        }}
      >
        의원 정보 없음
      </div>,
      { ...size },
    );
  }

  const currentTerm = terms.find((t) => t.termId === 22) ?? terms[0];
  const partyColor = currentTerm?.party.color ?? "#6B7280";
  const partyName = currentTerm?.party.name ?? "";
  const district = currentTerm?.district ?? "";
  const electedCount = currentTerm?.electedCount ?? member.electedCount;
  const electedLabel =
    electedCount === 1
      ? "초선"
      : electedCount === 2
        ? "재선"
        : `${electedCount}선`;

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
        backgroundColor: "#111827",
        fontFamily: "Pretendard",
      }}
    >
      {/* 정당 컬러 좌측 악센트 */}
      <div style={{ width: 12, height: "100%", backgroundColor: partyColor, display: "flex" }} />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "60px 80px",
          gap: 60,
        }}
      >
        {/* 의원 사진 */}
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: "50%",
            overflow: "hidden",
            border: `6px solid ${partyColor}`,
            display: "flex",
            flexShrink: 0,
          }}
        >
          <img
            src={member.photoUrl}
            alt={member.name}
            width={240}
            height={240}
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* 텍스트 정보 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontSize: 72, fontWeight: 700, color: "#ffffff" }}>{member.name}</span>
            <span style={{ fontSize: 32, color: "#9CA3AF" }}>의원</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                backgroundColor: partyColor,
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 700,
                padding: "6px 16px",
                borderRadius: 8,
                display: "flex",
              }}
            >
              {partyName}
            </div>
            <span style={{ fontSize: 24, color: "#D1D5DB" }}>{electedLabel}</span>
          </div>

          {district && <span style={{ fontSize: 28, color: "#9CA3AF" }}>{district}</span>}

          <span style={{ fontSize: 20, color: "#6B7280", marginTop: 8 }}>
            국회의원 의정활동 정보
          </span>
        </div>
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
