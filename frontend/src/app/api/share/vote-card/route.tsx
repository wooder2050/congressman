import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const voteId = searchParams.get("voteId");
  const memberId = searchParams.get("memberId");

  if (!voteId || !API_BASE) {
    return new Response("voteId is required", { status: 400 });
  }

  let fontData: ArrayBuffer | null = null;
  try {
    const fontRes = await fetch(
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Bold.woff",
    );
    if (fontRes.ok) fontData = await fontRes.arrayBuffer();
  } catch {
    // CDN failure - fall back to system font
  }

  // Fetch vote data
  let vote: {
    billName: string;
    procResult: string;
    resultCode: string;
    yesCount: number;
    noCount: number;
    abstainCount: number;
    memberTotal: number;
    voteTotal: number;
    procDate: string;
  } | null = null;

  let memberVoteResult: string | null = null;
  let memberName: string | null = null;

  try {
    const res = await fetch(`${API_BASE}/api/votes/${voteId}/member-votes`);
    if (res.ok) {
      const data = await res.json();
      vote = data.vote;

      if (memberId && data.memberVotes) {
        const mv = data.memberVotes.find((v: { memberId: string }) => v.memberId === memberId);
        if (mv) {
          memberName = mv.memberName;
          const resultMap: Record<string, string> = {
            yes: "찬성",
            no: "반대",
            abstain: "기권",
            absent: "불참",
          };
          memberVoteResult = resultMap[mv.result] ?? mv.result;
        }
      }
    }
  } catch {
    // API error
  }

  if (!vote) {
    return new Response("Vote not found", { status: 404 });
  }

  const isPassed = vote.resultCode === "passed" || vote.resultCode === "amended";
  const absentCount = vote.memberTotal - vote.voteTotal;

  const resultColor = isPassed ? "#10B981" : "#EF4444";
  const memberResultColor =
    memberVoteResult === "찬성"
      ? "#10B981"
      : memberVoteResult === "반대"
        ? "#EF4444"
        : memberVoteResult === "기권"
          ? "#6B7280"
          : "#9CA3AF";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        fontFamily: "Pretendard",
        position: "relative",
      }}
    >
      {/* Top bar */}
      <div style={{ width: "100%", height: 6, backgroundColor: resultColor, display: "flex" }} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "48px 64px",
          gap: 32,
        }}
      >
        {/* Site name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20, color: "#6B7280", fontWeight: 700 }}>lawmake.kr</span>
          <span style={{ fontSize: 20, color: "#D1D5DB" }}>|</span>
          <span style={{ fontSize: 20, color: "#9CA3AF" }}>표결 결과</span>
        </div>

        {/* Bill name */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.3,
              display: "flex",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {vote.billName.length > 40 ? vote.billName.slice(0, 40) + "..." : vote.billName}
          </div>

          {/* Result badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                backgroundColor: resultColor,
                color: "#ffffff",
                padding: "8px 24px",
                borderRadius: 8,
                fontSize: 28,
                fontWeight: 700,
                display: "flex",
              }}
            >
              {vote.procResult}
            </div>
            <span style={{ fontSize: 22, color: "#6B7280" }}>{vote.procDate}</span>
          </div>
        </div>

        {/* Vote counts */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#F0FDF4",
              borderRadius: 12,
              padding: "16px 32px",
              minWidth: 120,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, color: "#16A34A" }}>{vote.yesCount}</span>
            <span style={{ fontSize: 16, color: "#6B7280" }}>찬성</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#FEF2F2",
              borderRadius: 12,
              padding: "16px 32px",
              minWidth: 120,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, color: "#DC2626" }}>{vote.noCount}</span>
            <span style={{ fontSize: 16, color: "#6B7280" }}>반대</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: "16px 32px",
              minWidth: 120,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, color: "#6B7280" }}>
              {vote.abstainCount}
            </span>
            <span style={{ fontSize: 16, color: "#6B7280" }}>기권</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: "16px 32px",
              minWidth: 120,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 700, color: "#9CA3AF" }}>{absentCount}</span>
            <span style={{ fontSize: 16, color: "#6B7280" }}>불참</span>
          </div>

          {/* Member vote info */}
          {memberName && memberVoteResult && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: "auto",
                borderLeft: "2px solid #E5E7EB",
                paddingLeft: 32,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
                {memberName} 의원
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: memberResultColor,
                  marginTop: 4,
                }}
              >
                {memberVoteResult}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      ...(fontData && {
        fonts: [
          { name: "Pretendard", data: fontData, style: "normal" as const, weight: 700 as const },
        ],
      }),
    },
  );
}
