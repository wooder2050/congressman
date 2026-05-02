import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
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
