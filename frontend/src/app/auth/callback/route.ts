import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSafeInternalPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // open redirect 방지: 같은 origin의 안전한 상대 경로만 허용(//host, /\host, scheme 차단)
  const safeNext = isSafeInternalPath(next) ? next : "/";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
