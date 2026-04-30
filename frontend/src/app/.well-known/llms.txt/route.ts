import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/llms.txt", "https://www.lawmake.kr"), 301);
}
