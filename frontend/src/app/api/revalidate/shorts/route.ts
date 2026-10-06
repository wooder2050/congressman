import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { shortsCacheTag } from "@/lib/api";
import { AUDIT_2026, auditCommitteePath } from "@/data/audit-2026";

/**
 * 쇼츠 등록 CLI(backend `pnpm shorts:*`)가 DB 저장 뒤 호출한다.
 * 태그·경로는 요청 본문에서 받지 않고 허용 목록으로 계산한다 — 비밀값이 새도 임의 경로 재생성은 못 하게.
 */
const ISSUE_PATHS: Record<
  string,
  { hub: string; committeePath: (name: string) => string; committees: string[] }
> = {
  "audit-2026": {
    hub: AUDIT_2026.path,
    committeePath: auditCommitteePath,
    committees: AUDIT_2026.committees.map((c) => c.name),
  },
};

function authorized(header: string | null): boolean {
  const secret = process.env.SHORTS_REVALIDATE_SECRET;
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: NextRequest) {
  if (!authorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { issueSlug?: unknown; committees?: unknown; home?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const issueSlug = typeof body.issueSlug === "string" ? body.issueSlug : "";
  const issue = ISSUE_PATHS[issueSlug];
  if (!issue) return NextResponse.json({ error: "unknown issueSlug" }, { status: 400 });

  const committees = Array.isArray(body.committees)
    ? body.committees.filter(
        (c): c is string => typeof c === "string" && issue.committees.includes(c),
      )
    : [];

  const tag = shortsCacheTag(issueSlug);
  revalidateTag(tag, { expire: 0 });
  const paths = [issue.hub, ...committees.map(issue.committeePath)];
  if (body.home === true) paths.push("/");
  // 한글 위원회 경로는 캐시 키가 인코딩·디코딩 중 어느 쪽인지 버전마다 달라 둘 다 무효화한다
  for (const p of paths) {
    revalidatePath(p);
    const decoded = decodeURIComponent(p);
    if (decoded !== p) revalidatePath(decoded);
  }

  return NextResponse.json({ revalidated: true, tag, paths });
}
