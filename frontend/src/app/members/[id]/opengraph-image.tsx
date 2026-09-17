import { ImageResponse } from "next/og";
import { getMember, getMemberTerms } from "@/lib/api";
import { getElectedLabel } from "@/lib/utils";

export const runtime = "edge";
export const alt = "의원 프로필";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_ORIGIN = "https://www.lawmake.kr";
/**
 * 사진 요청 폭. 카드의 원형 사진은 240px이라 그보다 큰 값을 쓴다.
 * next.config.ts에 imageSizes·deviceSizes를 따로 두지 않아 Next 기본 목록만 허용되는데,
 * 480은 그 목록에 없어 최적화기가 400을 준다(실측). 기본 목록에 있는 384를 쓴다.
 */
const PHOTO_REQUEST_WIDTH = 384;
/**
 * 사진을 받을 때의 다운로드 상한. 384px로 리사이즈된 결과는 보통 10~40KB다.
 * 스트림을 읽으며 이 값을 넘으면 즉시 끊는다(16MB 원본을 다 받고 버리지 않기 위해).
 */
const MAX_PHOTO_BYTES = 512 * 1024;
/**
 * 디코딩을 허용할 픽셀 상한. 384px 리사이즈 결과는 0.5MP 미만이라 넉넉한 값이다.
 *
 * 국회 사이트 사진에는 10384x14999(155MP, 김현 의원) 같은 것이 섞여 있는데,
 * Next 이미지 최적화기가 이런 초대형 이미지는 리사이즈를 포기하고 원본을 그대로
 * 반환한다. 그 원본을 satori에 넘기면 디코딩에서 터져 OG 라우트 전체가 500이 됐다
 * (2026-09-17 GSC 색인 보고서에서 발견).
 *
 * 바이트 수만으로는 이 경우를 가릴 수 없다 — 실측상 16MB(강선우, 37MP)는 정상 렌더되고
 * 4.8MB(김현, 155MP)가 터졌다. 압축률 높은 대형 PNG도 작은 파일로 많은 픽셀을 담을 수
 * 있으므로 헤더에서 실제 해상도를 읽어 판정한다.
 */
const MAX_PHOTO_PIXELS = 2_000_000;
const PHOTO_TIMEOUT_MS = 5000;
const FONT_TIMEOUT_MS = 3000;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  // 한 번에 spread하면 인자 수 제한에 걸리므로 나눠서 변환한다
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/** 응답 본문을 최대 max바이트까지만 읽는다. 넘으면 연결을 끊고 null */
async function readCapped(res: Response, max: number): Promise<Uint8Array | null> {
  const declared = Number(res.headers.get("content-length"));
  // Content-Length는 없을 수도 있으므로 조기 거절용으로만 쓴다
  if (Number.isFinite(declared) && declared > max) {
    await res.body?.cancel();
    return null;
  }
  const reader = res.body?.getReader();
  if (!reader) return null;

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

const JPEG_SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb]);

/** PNG·JPEG 헤더에서 총 픽셀 수를 읽는다. 형식을 모르거나 파싱에 실패하면 null */
function imagePixels(bytes: Uint8Array): number | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // PNG — IHDR의 width·height가 고정 위치에 있다
  if (
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return view.getUint32(16) * view.getUint32(20);
  }

  // JPEG — SOF 마커를 찾을 때까지 세그먼트를 건너뛴다
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = bytes[i + 1];
      // 길이 필드가 없는 마커들(패딩·RSTn·SOI/EOI)
      if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
        i += 2;
        continue;
      }
      if (JPEG_SOF_MARKERS.has(marker)) {
        // SOF: [FF Cx][길이 2][정밀도 1][높이 2][너비 2] — 높이가 먼저다
        const height = view.getUint16(i + 5);
        const width = view.getUint16(i + 7);
        return width * height;
      }
      i += 2 + view.getUint16(i + 2);
    }
  }

  return null;
}

/**
 * 의원 사진을 data URI로 읽어온다. 실패하면 null — 호출부는 사진 없는 카드를 그린다.
 *
 * satori가 직접 원격 이미지를 가져가게 두지 않는 이유는 두 가지다.
 * 1) assembly.go.kr은 Referer 없는 요청에 400을 준다(lib/photo.ts 참고)
 * 2) 가져오기·디코딩이 실패하면 ImageResponse 스트림에서 터지는데, 생성자 주변
 *    try/catch로는 그 시점의 오류를 잡을 수 없다
 */
async function loadPhotoDataUri(photoUrl: string | undefined): Promise<string | null> {
  if (!photoUrl) return null;
  const optimized = `${SITE_ORIGIN}/_next/image?url=${encodeURIComponent(photoUrl)}&w=${PHOTO_REQUEST_WIDTH}&q=75`;
  try {
    const res = await fetch(optimized, {
      // 헤더를 파싱할 수 있는 형식으로 받는다(webp·avif로 협상되지 않도록)
      headers: { Accept: "image/jpeg,image/png" },
      signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (type !== "image/jpeg" && type !== "image/png") {
      await res.body?.cancel();
      return null;
    }

    const bytes = await readCapped(res, MAX_PHOTO_BYTES);
    if (!bytes) return null;

    const pixels = imagePixels(bytes);
    // 해상도를 못 읽으면 넣지 않는다(fail-closed) — 최적화가 원본을 흘려보낸 경우일 수 있다
    if (pixels === null || pixels > MAX_PHOTO_PIXELS) return null;

    return `data:${type};base64,${toBase64(bytes)}`;
  } catch {
    return null;
  }
}

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
  const electedLabel = getElectedLabel(electedCount);

  async function loadFont(): Promise<ArrayBuffer | null> {
    try {
      const fontRes = await fetch(
        "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Bold.woff",
        // 타임아웃이 없으면 CDN이 응답을 붙들 때 카드 생성 전체가 묶인다
        { signal: AbortSignal.timeout(FONT_TIMEOUT_MS) },
      );
      return fontRes.ok ? await fontRes.arrayBuffer() : null;
    } catch {
      // CDN 장애 시 시스템 폰트 폴백
      return null;
    }
  }

  const [photoDataUri, fontData] = await Promise.all([
    loadPhotoDataUri(member.photoUrl),
    loadFont(),
  ]);

  const renderCard = (photo: string | null) => (
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
        {/* 의원 사진 — 못 불러오면 이름 첫 글자 원형으로 대체(사이트 MemberAvatar와 같은 처리) */}
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: "50%",
            overflow: "hidden",
            border: `6px solid ${partyColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: photo ? undefined : partyColor,
            flexShrink: 0,
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt={member.name}
              width={240}
              height={240}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 110, fontWeight: 700, color: "#ffffff" }}>
              {member.name.slice(0, 1)}
            </span>
          )}
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
    </div>
  );

  const options = {
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
  };

  // ImageResponse는 스트림에서 렌더링하므로, 여기서 본문을 끝까지 읽어야 렌더 오류를 잡을 수 있다.
  // 사진 때문에 실패하면 사진 없는 카드로 한 번 더 시도한다 — 500보다는 글자만 있는 카드가 낫다.
  async function toPng(photo: string | null): Promise<ArrayBuffer> {
    return await new ImageResponse(renderCard(photo), options).arrayBuffer();
  }

  let png: ArrayBuffer;
  try {
    png = await toPng(photoDataUri);
  } catch {
    png = await toPng(null);
  }

  return new Response(png, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}
