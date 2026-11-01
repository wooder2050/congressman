import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const ALLOWED_HOST = "www.assembly.go.kr";
const ALLOWED_PATH_PREFIX = "/static/portal/img/";
const CACHE_SECONDS = 60 * 60 * 24 * 7; // 7일
// 국회 원본은 평균 1MB, 최대 9MB인데 화면에는 아바타로만 쓴다. 전송량(Fast Origin Transfer)을 줄이려고 줄여서 내려준다.
const OUTPUT_WIDTH = 320;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  if (!parsed.pathname.startsWith(ALLOWED_PATH_PREFIX)) {
    return NextResponse.json({ error: "path not allowed" }, { status: 403 });
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/webp,image/*,*/*",
      Referer: "https://www.assembly.go.kr/",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "upstream error" }, { status: res.status });
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "not an image" }, { status: 403 });
  }
  const original = Buffer.from(await res.arrayBuffer());

  let body: Uint8Array<ArrayBuffer> = new Uint8Array(original);
  let outputType = contentType;
  try {
    body = new Uint8Array(
      await sharp(original)
        .rotate()
        .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer(),
    );
    outputType = "image/webp";
  } catch {
    // 변환에 실패하면 원본을 그대로 내려준다
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": outputType,
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
