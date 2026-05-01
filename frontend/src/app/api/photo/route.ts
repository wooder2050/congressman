import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "www.assembly.go.kr";
const ALLOWED_PATH_PREFIX = "/static/portal/img/";
const CACHE_SECONDS = 60 * 60 * 24 * 7; // 7일

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
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
