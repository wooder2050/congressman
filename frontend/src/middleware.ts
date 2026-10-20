import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// 지방선거 시도 페이지의 `?sigungu=` 주소 → 시군구별 메타(제목·canonical)를 가진 ISR 경로로 rewrite
const REGION_SIDO_PATH = /^\/local-elections\/\d{4}\/regions\/[^/]+$/;

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sigungu = searchParams.get("sigungu");
  if (sigungu && REGION_SIDO_PATH.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/sigungu/${encodeURIComponent(sigungu)}`;
    return NextResponse.rewrite(url);
  }

  // Supabase 환경변수가 없으면 건너뛰기 (CI 빌드 등)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  // Supabase auth 쿠키가 있는 경우에만 세션 갱신 수행
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!hasAuthCookie) return NextResponse.next();

  return await updateSession(request);
}

export const config = {
  matcher: [
    // 정적 파일, 이미지, 파비콘 제외
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|geo/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|json)$).*)",
  ],
};
