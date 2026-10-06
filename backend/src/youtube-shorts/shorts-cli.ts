/**
 * 유튜브 쇼츠 등록·수정·숨김 CLI — 영상마다 프론트를 배포하지 않고 DB만 바꾼다.
 *
 *   pnpm shorts:add <유튜브 URL|ID> --committee 법제사법위원회 --title "..." --description "..." \
 *        --published-at 2026-10-06T19:44:00+09:00 [--source-url URL] [--duration 39] [--home] [--note "..."] [--approve]
 *   pnpm shorts:update <ID> [위와 같은 옵션]          # 준 옵션만 바꾼다
 *   pnpm shorts:hide <ID>   /   pnpm shorts:show <ID>   # 노출 끄기·켜기
 *   pnpm shorts:refresh [<ID>]                         # SQL로 직접 고친 뒤 캐시·화면만 갱신
 *   pnpm shorts:list
 *
 * 저장 순서: DB 커밋 → 사이트 재검증 호출(허브·관련 상임위·홈). 쇼츠 API는 Redis 캐시가 없어 DB가 곧 원본이다.
 * 재검증은 SHORTS_REVALIDATE_SECRET이 있어야 하며, 실패해도 DB 저장은 유지하고 재시도 안내를 출력한다.
 * NestJS DI 없이 PrismaClient를 직접 쓴다(sync 스크립트와 같은 이유: tsx + decorator).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { SHORTS_ISSUES } from './youtube-shorts.service';

/** 국감 페이지 주소와 같은 정식 위원회명(frontend/src/data/audit-2026.ts) */
const COMMITTEES = [
  '국회운영위원회',
  '법제사법위원회',
  '정무위원회',
  '재정경제기획위원회',
  '교육위원회',
  '과학기술정보방송통신위원회',
  '외교통일위원회',
  '국방위원회',
  '행정안전위원회',
  '문화체육관광위원회',
  '농림축산식품해양수산위원회',
  '산업통상자원중소벤처기업위원회',
  '보건복지위원회',
  '기후에너지환경노동위원회',
  '국토교통위원회',
  '정보위원회',
  '성평등가족위원회',
];

const REVALIDATE_URL =
  process.env.SHORTS_REVALIDATE_URL ?? 'https://www.lawmake.kr/api/revalidate/shorts';
const API_URL = process.env.SHORTS_VERIFY_API_URL ?? 'https://api.lawmake.kr/api/youtube-shorts';

const prisma = new PrismaClient();

/** shorts/ID · watch?v=ID · youtu.be/ID · 11자리 ID만 받는다 */
function parseVideoId(input: string): string {
  const raw = input.trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`유튜브 URL이나 11자리 ID가 아닙니다: ${input}`);
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (host === 'youtube.com') {
    id =
      url.searchParams.get('v') ??
      url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1] ??
      null;
  }
  if (!id || !/^[\w-]{11}$/.test(id)) throw new Error(`영상 ID를 찾지 못했습니다: ${input}`);
  return id;
}

function parseArgs(argv: string[]): { positional: string[]; flags: Record<string, string | true> } {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else flags[key] = true;
    } else positional.push(a);
  }
  return { positional, flags };
}

function str(flags: Record<string, string | true>, key: string): string | undefined {
  const v = flags[key];
  return typeof v === 'string' ? v : undefined;
}

function committeeArg(flags: Record<string, string | true>): string | null | undefined {
  const v = str(flags, 'committee');
  if (v === undefined) return undefined;
  if (v === 'none') return null;
  if (!COMMITTEES.includes(v)) {
    throw new Error(`정식 위원회명이 아닙니다: ${v}\n가능: ${COMMITTEES.join(', ')}`);
  }
  return v;
}

/** 저장 뒤 사이트 재검증. 영향받는 위원회는 변경 전·후 모두 */
async function refreshSite(
  issueSlug: string,
  committees: (string | null | undefined)[],
  home: boolean,
) {
  const secret = process.env.SHORTS_REVALIDATE_SECRET;
  const names = [...new Set(committees.filter((c): c is string => !!c))];
  if (!secret) {
    console.warn('SHORTS_REVALIDATE_SECRET 없음 — 화면은 데이터 캐시가 끝나는 최대 1시간 뒤 반영');
    return;
  }
  try {
    const res = await fetch(REVALIDATE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueSlug, committees: names, home }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${body.slice(0, 200)}`);
    console.log(`사이트 재검증 완료: ${body.slice(0, 300)}`);
  } catch (err) {
    console.error(
      `저장은 됐지만 화면 갱신 호출 실패 — 'pnpm shorts:refresh'로 다시 시도하세요: ${err}`,
    );
    process.exitCode = 1;
  }
}

async function verify(issueSlug: string, videoId: string, expectVisible: boolean) {
  try {
    const res = await fetch(`${API_URL}?issueSlug=${issueSlug}&placement=hub&limit=6`);
    if (!res.ok) {
      console.warn(`API 확인 생략(${res.status}) — 백엔드 배포 전일 수 있습니다`);
      return;
    }
    const items = (await res.json()) as { videoId: string }[];
    const visible = items.some((i) => i.videoId === videoId);
    console.log(
      visible === expectVisible
        ? `API 확인: ${videoId} ${visible ? '노출 중' : '노출 안 됨'}(기대와 일치)`
        : `API 확인 불일치: ${videoId} 노출=${visible}, 기대=${expectVisible} — 잠시 뒤 다시 확인`,
    );
  } catch (err) {
    console.warn(`API 확인 실패: ${err}`);
  }
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { positional, flags } = parseArgs(rest);
  const issueSlug = str(flags, 'issue') ?? 'audit-2026';
  if (!(SHORTS_ISSUES as readonly string[]).includes(issueSlug))
    throw new Error(`허용되지 않은 이슈: ${issueSlug}`);

  if (command === 'list') {
    const rows = await prisma.youTubeShort.findMany({ orderBy: { publishedAt: 'desc' } });
    for (const r of rows) {
      console.log(
        `${r.active ? '●' : '○'} ${r.videoId} ${r.publishedAt.toISOString().slice(0, 16)} ${r.committee ?? '(허브)'}${r.showOnHome ? ' [홈]' : ''} — ${r.title}`,
      );
    }
    return;
  }

  if (command === 'refresh') {
    const id = positional[0] ? parseVideoId(positional[0]) : null;
    const rows = id
      ? await prisma.youTubeShort.findMany({ where: { videoId: id } })
      : await prisma.youTubeShort.findMany({ where: { issueSlug } });
    await refreshSite(
      issueSlug,
      rows.map((r) => r.committee),
      rows.some((r) => r.showOnHome),
    );
    return;
  }

  const id = positional[0] ? parseVideoId(positional[0]) : undefined;
  if (!id) throw new Error('영상 URL 또는 ID가 필요합니다');
  const before = await prisma.youTubeShort.findUnique({ where: { videoId: id } });

  if (command === 'hide' || command === 'show') {
    if (!before) throw new Error(`등록되지 않은 영상: ${id}`);
    await prisma.youTubeShort.update({
      where: { videoId: id },
      data: { active: command === 'show' },
    });
    console.log(`${id} ${command === 'show' ? '노출' : '숨김'}`);
    await refreshSite(before.issueSlug, [before.committee], before.showOnHome);
    await verify(before.issueSlug, id, command === 'show');
    return;
  }

  if (command !== 'add' && command !== 'update') throw new Error(`알 수 없는 명령: ${command}`);

  const committee = committeeArg(flags);
  const publishedRaw = str(flags, 'published-at');
  const publishedAt = publishedRaw ? new Date(publishedRaw) : undefined;
  if (publishedAt && Number.isNaN(publishedAt.getTime()))
    throw new Error(`날짜 형식 오류: ${publishedRaw}`);
  const duration = str(flags, 'duration');
  const data = {
    title: str(flags, 'title'),
    description: str(flags, 'description'),
    publishedAt,
    durationSeconds: duration ? parseInt(duration, 10) : undefined,
    committee,
    issueSlug,
    sourceUrl: str(flags, 'source-url'),
    editorialNote: str(flags, 'note'),
    showOnHome: flags.home === true ? true : flags['no-home'] === true ? false : undefined,
    active: flags.approve === true ? true : undefined,
  };

  if (command === 'add') {
    if (before) throw new Error(`이미 등록된 영상입니다(${id}) — shorts:update를 쓰세요`);
    if (!data.title || !data.publishedAt)
      throw new Error('add에는 --title, --published-at이 필요합니다');
    await prisma.youTubeShort.create({
      data: {
        videoId: id,
        title: data.title,
        description: data.description ?? '',
        publishedAt: data.publishedAt,
        durationSeconds: data.durationSeconds ?? null,
        committee: data.committee ?? null,
        issueSlug,
        sourceUrl: data.sourceUrl ?? null,
        editorialNote: data.editorialNote ?? null,
        showOnHome: data.showOnHome ?? false,
        active: data.active ?? false,
      },
    });
    console.log(
      `${id} 등록(${data.active ? '노출' : '미노출 — --approve 또는 shorts:show로 노출'})`,
    );
  } else {
    if (!before) throw new Error(`등록되지 않은 영상: ${id}`);
    const patch = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    await prisma.youTubeShort.update({ where: { videoId: id }, data: patch });
    console.log(`${id} 수정: ${Object.keys(patch).join(', ')}`);
  }

  const after = await prisma.youTubeShort.findUnique({ where: { videoId: id } });
  await refreshSite(
    issueSlug,
    [before?.committee, after?.committee],
    !!(before?.showOnHome || after?.showOnHome),
  );
  await verify(issueSlug, id, !!after?.active && (after?.publishedAt ?? new Date()) <= new Date());
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
