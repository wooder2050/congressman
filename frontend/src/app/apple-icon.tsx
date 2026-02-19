import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "#1E3A5F",
        borderRadius: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 32 32" width="120" height="120" fill="none">
        <rect x="5" y="14" width="3" height="12" rx="0.5" fill="white" />
        <rect x="11" y="14" width="3" height="12" rx="0.5" fill="white" />
        <rect x="18" y="14" width="3" height="12" rx="0.5" fill="white" />
        <rect x="24" y="14" width="3" height="12" rx="0.5" fill="white" />
        <path d="M2 14.5 L16 4 L30 14.5 Z" fill="white" />
        <ellipse cx="16" cy="6" rx="4" ry="3" fill="white" opacity="0.8" />
        <rect x="15" y="2" width="2" height="4" rx="1" fill="white" opacity="0.8" />
        <rect x="3" y="26" width="26" height="3" rx="1" fill="white" />
      </svg>
    </div>,
    { ...size },
  );
}
