import { ImageResponse } from "next/og";
import { getMember, getMemberTerms } from "@/lib/api";
import { getElectedLabel } from "@/lib/utils";

export const runtime = "edge";
export const alt = "의원 프로필";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * assembly.go.kr은 User-Agent가 없는 요청에 400을 준다(실측 2026-09-17).
 * Referer는 필요 없다 — lib/photo.ts 주석은 이 점이 부정확하다.
 */
const PHOTO_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
/** 해상도만 알면 되므로 앞부분만 받는다. SOF/IHDR 마커는 보통 이 안에 있다 */
const PHOTO_HEADER_BYTES = 64 * 1024;
/**
 * satori에 넘겨도 되는 픽셀 상한.
 *
 * 국회 사이트 사진에는 10384x14999(155MP, 김현 의원) 같은 것이 섞여 있는데, 이를 satori가
 * 디코딩하다 터지면 OG 라우트 전체가 500이 된다(2026-09-17 GSC 색인 보고서에서 발견).
 * 파일 크기와는 무관하다 — 실측상 16MB·37MP(강선우)는 정상 렌더되고 4.8MB·155MP가 실패했다.
 *
 * 67MP(이춘석)까지는 정상 확인됐고 155MP가 실패했으므로 그 사이에서 보수적으로 잡는다.
 * 22대 현직 299명 중 이 값을 넘는 사람은 김현 의원 1명뿐이다.
 */
const MAX_PHOTO_PIXELS = 80_000_000;
const PHOTO_TIMEOUT_MS = 4000;
const FONT_TIMEOUT_MS = 3000;

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
 * 사진을 satori에 넘겨도 되는지 헤더만 읽어 판정한다.
 *
 * 사진 자체는 예전처럼 satori가 원격 URL에서 직접 가져간다. 우리가 미리 받아
 * data URI로 넘기는 방식을 썼다가 프로덕션에서 모든 사진이 빠지는 회귀가 있었다
 * (2026-09-17). 원격 로드는 299명 중 298명에게 이미 검증된 경로이므로 건드리지 않고,
 * 터지는 것으로 확인된 초대형 사진만 제외한다.
 *
 * 판정에 실패하면 true — 기존 동작을 유지한다(fail-open). 잘못 제외해 전원의 사진을
 * 잃는 쪽이, 드물게 렌더가 실패하는 쪽보다 나쁘다. 렌더 실패는 호출부에서 사진 없는
 * 카드로 재시도해 500을 막는다.
 */
async function isPhotoRenderable(photoUrl: string | undefined): Promise<boolean> {
  if (!photoUrl) return false;
  try {
    const res = await fetch(photoUrl, {
      headers: {
        "User-Agent": PHOTO_USER_AGENT,
        Range: `bytes=0-${PHOTO_HEADER_BYTES - 1}`,
      },
      signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS),
    });
    // 416(파일이 Range보다 작음) 포함 — 판정 불가는 기존 동작 유지
    if (!res.ok && res.status !== 206) return true;

    const pixels = imagePixels(new Uint8Array(await res.arrayBuffer()));
    if (pixels === null) return true;
    return pixels <= MAX_PHOTO_PIXELS;
  } catch {
    return true;
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

  const [photoRenderable, fontData] = await Promise.all([
    isPhotoRenderable(member.photoUrl),
    loadFont(),
  ]);
  const photoUrl = photoRenderable ? member.photoUrl : null;

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
    png = await toPng(photoUrl);
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
