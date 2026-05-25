import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

/** 파싱 실패 통계 (silent null 방지) */
interface ParseStats {
  total: number;
  parsed: number;
  parseFailures: { count: number; samples: string[] };
  bigintFailures: { count: number; samples: string[] };
}

/**
 * opengirok 국회 고위공직자 재산 CSV → CandidateAssetItem
 *
 * 데이터 출처:
 *   정보공개센터 GitHub https://github.com/opengirok/congress_asset_disclosure
 *   각 연도별 Google Sheets URL이 README에 있음. 시트 탭을 활성화한 뒤 export?gid=... 로 CSV 다운로드.
 *
 * 다운로드 받은 CSV를 backend/data/opengirok/ 에 두고 실행 (data 폴더는 gitignore).
 *
 * 사용법:
 *   pnpm tsx backend/src/sync/scripts/import-opengirok-assets.ts <csv-file> [--source-date YYYY-MM-DD] [--source-url URL]
 *
 * 지원 포맷:
 *   - 2024 공보 형식: 신고구분, 소속구분, 소속, 직위, 성명, 재산구분, 본인과의 관계, 재산의종류, 소재지..., 가액, 실거래가격, 비고
 *   - 2025 정기변동 형식: NO, 구분, 소속, 직위, 이름, 재산구분, 본인과의 관계, 재산의종류, 소재지..., 종전가액, 증가액, 증가액실거래가격, 감소액, 감소액실거래가격, 현재가액, 변동사유
 *   - 2024-change(재등록의원): 2024 헤더 + 변동 컬럼 혼합
 *
 * 매칭 전략 (보수적):
 *   1) opengirok 행은 "국회" + "국회의원" 직위만 사용 (다른 행 무시)
 *   2) Member.name + Member.birthDate 매치되는 22대 의원의 ID 확보
 *   3) 그 의원과 같은 이름의 LocalElectionCandidate / Candidate에 birthDate까지 일치하면 매칭
 *   4) 매칭된 후보에 한해 source='opengirok'로 CandidateAssetItem 적재 (중복 방지를 위해 사전 DELETE 권장)
 */

type Row = Record<string, string>;

interface ParsedAsset {
  name: string;
  category: string;
  subCategory: string | null;
  relation: string;
  description: string;
  currentValue: bigint | null;
  previousValue: bigint | null;
  increaseValue: bigint | null;
  decreaseValue: bigint | null;
  marketPrice: bigint | null;
  changeReason: string | null;
}

/**
 * 천원 단위 숫자 문자열 → 원 단위 BigInt.
 * - 빈 문자열·"-"·NaN → null (의도된 미입력)
 * - 0 → BigInt(0) (0과 미입력을 구분, 리뷰 #5 대응)
 * - BigInt 변환 실패 → null + stats 누적
 */
function parseWonFromThousands(text: string | undefined | null, stats?: ParseStats): bigint | null {
  if (text === undefined || text === null) return null;
  const trimmed = text.trim();
  if (!trimmed || trimmed === '-') return null;
  // 숫자·마이너스만 추출 (괄호·따옴표·콤마·공백 등 모두 제거)
  const cleaned = trimmed.replace(/[^0-9-]/g, '');
  if (!cleaned || cleaned === '-') return null;
  try {
    return BigInt(cleaned) * BigInt(1000);
  } catch {
    if (stats) {
      stats.bigintFailures.count++;
      if (stats.bigintFailures.samples.length < 5) {
        stats.bigintFailures.samples.push(text);
      }
    }
    return null;
  }
}

function normalizeText(s: string | undefined | null): string {
  return (s ?? '').trim().replace(/\s+/g, ' ');
}

function detectFormat(headers: string[]): '2024' | '2025' | '2024-change' {
  if (headers.includes('이름') && headers.includes('현재가액')) return '2025';
  if (headers.includes('성명') && headers.includes('가액')) return '2024';
  if (headers.includes('성명') && headers.includes('현재가액')) return '2024-change';
  throw new Error(`Unknown CSV format. Headers: ${headers.join(', ')}`);
}

function findKey(row: Row, candidates: string[]): string | undefined {
  for (const c of candidates) {
    if (c in row) return c;
    // 공백 가변 매칭
    const found = Object.keys(row).find((k) => k.replace(/\s+/g, '') === c.replace(/\s+/g, ''));
    if (found) return found;
  }
  return undefined;
}

function get(row: Row, candidates: string[]): string {
  const k = findKey(row, candidates);
  return k ? normalizeText(row[k]) : '';
}

function getNum(row: Row, candidates: string[], stats?: ParseStats): bigint | null {
  const k = findKey(row, candidates);
  return k ? parseWonFromThousands(row[k], stats) : null;
}

function parseRow(
  row: Row,
  format: '2024' | '2025' | '2024-change',
  stats?: ParseStats,
): ParsedAsset | null {
  const nameKey = format === '2025' ? '이름' : '성명';
  const name = get(row, [nameKey]);
  if (!name) return null;

  const base = {
    name,
    category: get(row, ['재산구분']),
    subCategory: get(row, ['재산의종류']) || null,
    relation: get(row, ['본인과의 관계']),
    description: get(row, ['소재지 면적 등 권리의 명세', '소재지  면적  등 권리의 명세']),
  };

  if (format === '2024') {
    return {
      ...base,
      currentValue: getNum(row, ['가액'], stats),
      previousValue: null,
      increaseValue: null,
      decreaseValue: null,
      marketPrice: getNum(row, ['실거래가격'], stats),
      changeReason: get(row, ['비고']) || null,
    };
  }
  // 2025 또는 2024-change (모두 변동 컬럼 보유)
  return {
    ...base,
    currentValue: getNum(row, ['현재가액'], stats),
    previousValue: getNum(row, ['종전가액'], stats),
    increaseValue: getNum(row, ['증가액'], stats),
    decreaseValue: getNum(row, ['감소액'], stats),
    marketPrice:
      getNum(row, ['증가액실거래가격', '증가액_실거래가격'], stats) ??
      getNum(row, ['감소액실거래가격', '감소액_실거래가격'], stats),
    changeReason: get(row, ['변동사유']) || null,
  };
}

function isAssemblyMember(row: Row, format: '2024' | '2025' | '2024-change'): boolean {
  const affiliation = get(row, format === '2025' ? ['구분'] : ['소속구분']);
  const dept = get(row, ['소속']);
  return /국회의원/.test(affiliation) && dept === '국회';
}

interface CandidateMatch {
  localCandidateId: number | null;
  byCandidateId: number | null;
  candidateName: string;
}

/**
 * 22대 의원의 이름·생년월일 → 우리 DB 후보자 ID로 매칭
 * 동명이인 위험 회피:
 *   1) 22대 의원 안에 동명이인이 있으면 fail-closed (해당 이름 전체 제외)
 *   2) opengirok CSV는 이름만 식별자로 가지므로, 동명이인은 CSV 매칭 자체가 불가능
 *   3) 후보 테이블 매칭은 (name + birthDate YYYYMMDD) 정확 일치만 인정
 */
async function buildCandidateMap(prisma: PrismaClient): Promise<Map<string, CandidateMatch[]>> {
  // 22대 의원 (Member + MemberTerm.termId=22)
  const members = await prisma.member.findMany({
    where: { memberTerms: { some: { termId: 22 } } },
    select: { name: true, birthDate: true },
  });
  console.log(`[OpengirokImport] 22대 의원: ${members.length}명`);

  // 의원 이름별 카운트로 동명이인 식별
  const nameCount = new Map<string, number>();
  for (const m of members) {
    nameCount.set(m.name, (nameCount.get(m.name) ?? 0) + 1);
  }
  const duplicates = [...nameCount.entries()].filter(([, c]) => c > 1).map(([n]) => n);
  if (duplicates.length > 0) {
    console.warn(
      `[OpengirokImport] ⚠ 22대 의원 동명이인 ${duplicates.length}명 — opengirok CSV에 식별자 없어 import 제외: ${duplicates.join(', ')}`,
    );
  }

  const byName = new Map<string, { name: string; bdYmd: string }>();
  for (const m of members) {
    if (!m.birthDate) continue;
    if (nameCount.get(m.name)! > 1) continue; // 동명이인 fail-closed (리뷰 #1 critical)
    const bdYmd = m.birthDate.replace(/-/g, ''); // "1957-09-18" → "19570918"
    byName.set(m.name, { name: m.name, bdYmd });
  }

  // 후보자 테이블에서 (name, birthDate) 매칭
  const localCands = await prisma.localElectionCandidate.findMany({
    where: { name: { in: Array.from(byName.keys()) } },
    select: { id: true, name: true, birthDate: true },
  });
  const byCands = await prisma.candidate.findMany({
    where: { name: { in: Array.from(byName.keys()) } },
    select: { id: true, name: true, birthDate: true },
  });

  const result = new Map<string, CandidateMatch[]>();
  for (const c of localCands) {
    const m = byName.get(c.name);
    if (!m || !c.birthDate) continue;
    if (m.bdYmd !== c.birthDate) continue;
    const arr = result.get(c.name) ?? [];
    arr.push({ localCandidateId: c.id, byCandidateId: null, candidateName: c.name });
    result.set(c.name, arr);
  }
  for (const c of byCands) {
    const m = byName.get(c.name);
    if (!m || !c.birthDate) continue;
    if (m.bdYmd !== c.birthDate) continue;
    const arr = result.get(c.name) ?? [];
    arr.push({ localCandidateId: null, byCandidateId: c.id, candidateName: c.name });
    result.set(c.name, arr);
  }

  console.log(
    `[OpengirokImport] 매칭 가능 후보자: ${[...result.values()].reduce((a, b) => a + b.length, 0)}건 (이름 ${result.size}개)`,
  );
  return result;
}

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: pnpm tsx ... <csv-file> [--source-date YYYY-MM-DD] [--source-url URL]');
    process.exit(1);
  }
  const args = process.argv.slice(3);
  const sourceDate = args[args.indexOf('--source-date') + 1] ?? null;
  const sourceUrl = args[args.indexOf('--source-url') + 1] ?? null;

  const resolvedPath = path.resolve(csvPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');
  const records = parse(raw, { columns: true, skip_empty_lines: true, trim: true }) as Row[];
  const headers = Object.keys(records[0] ?? {});
  const format = detectFormat(headers);
  console.log(`[OpengirokImport] Loaded ${records.length} rows, format=${format}`);

  const prisma = new PrismaClient();
  await prisma.$connect();

  const stats: ParseStats = {
    total: 0,
    parsed: 0,
    parseFailures: { count: 0, samples: [] },
    bigintFailures: { count: 0, samples: [] },
  };
  const affectedLocalIds = new Set<number>();
  const affectedByIds = new Set<number>();

  try {
    const candidateMap = await buildCandidateMap(prisma);

    let processed = 0;
    let matched = 0;
    let inserted = 0;
    const unmatchedNames = new Set<string>();

    // Idempotency (리뷰 #7): 동일 source+sourceDate+sourceUrl 기준 사전 삭제 후 재삽입
    const deleteWhere = {
      source: 'opengirok',
      ...(sourceDate ? { sourceDate } : {}),
      ...(sourceUrl ? { sourceUrl } : {}),
    };
    const deleted = await prisma.candidateAssetItem.deleteMany({ where: deleteWhere });
    console.log(
      `[OpengirokImport] 기존 동일 출처 데이터 ${deleted.count}건 삭제 (source=opengirok, date=${sourceDate ?? 'any'})`,
    );

    for (const row of records) {
      if (!isAssemblyMember(row, format)) continue;
      processed++;
      stats.total++;
      const parsed = parseRow(row, format, stats);
      if (!parsed || !parsed.category || !parsed.relation) {
        stats.parseFailures.count++;
        if (stats.parseFailures.samples.length < 5) {
          stats.parseFailures.samples.push(JSON.stringify(row).slice(0, 200));
        }
        continue;
      }
      stats.parsed++;

      const matches = candidateMap.get(parsed.name);
      if (!matches || matches.length === 0) {
        unmatchedNames.add(parsed.name);
        continue;
      }
      matched++;

      for (const m of matches) {
        await prisma.candidateAssetItem.create({
          data: {
            localCandidateId: m.localCandidateId,
            byCandidateId: m.byCandidateId,
            category: parsed.category,
            subCategory: parsed.subCategory,
            relation: parsed.relation,
            description: parsed.description,
            currentValue: parsed.currentValue,
            previousValue: parsed.previousValue,
            increaseValue: parsed.increaseValue,
            decreaseValue: parsed.decreaseValue,
            marketPrice: parsed.marketPrice,
            changeReason: parsed.changeReason,
            source: 'opengirok',
            sourceUrl,
            sourceDate,
            rawJson: row as object,
          },
        });
        if (m.localCandidateId !== null) affectedLocalIds.add(m.localCandidateId);
        if (m.byCandidateId !== null) affectedByIds.add(m.byCandidateId);
        inserted++;
      }
    }

    console.log(`[OpengirokImport] Done`);
    console.log(`  국회의원 행: ${processed}`);
    console.log(`  매칭된 행: ${matched}`);
    console.log(`  생성된 자산 항목: ${inserted}`);
    console.log(`  매칭 실패 의원 이름: ${unmatchedNames.size}명`);
    if (unmatchedNames.size > 0 && unmatchedNames.size <= 50) {
      console.log(`    ${[...unmatchedNames].join(', ')}`);
    }

    // 파싱 실패 통계 (리뷰 #5: silent null 방지)
    if (stats.parseFailures.count > 0 || stats.bigintFailures.count > 0) {
      console.warn(`[OpengirokImport] ⚠ 파싱 통계 — 데이터 손실 가능성`);
      if (stats.parseFailures.count > 0) {
        console.warn(`  스키마 누락(카테고리/관계): ${stats.parseFailures.count}건`);
        console.warn(`  샘플: ${stats.parseFailures.samples.slice(0, 3).join(' | ')}`);
      }
      if (stats.bigintFailures.count > 0) {
        console.warn(`  금액 BigInt 변환 실패: ${stats.bigintFailures.count}건`);
        console.warn(`  샘플 값: ${stats.bigintFailures.samples.join(', ')}`);
      }
    }

    // Redis 캐시 무효화 (리뷰 #8) — 한도 초과는 경고만, 작업 자체는 성공
    const redis = createRedis();
    if (redis && (affectedLocalIds.size > 0 || affectedByIds.size > 0)) {
      const keysToDelete: string[] = [];
      // 후보 상세 캐시 키 패턴: local-elections:<electionId>:candidate:<id>
      // electionId가 없어 와일드카드 무효화는 SCAN 필요 → 영향받은 ID로 직접 무효화는 어렵고
      // election 식별자 추정 불가하므로 알려진 패턴만 정리. 추후 cache key를 단순화하면 좋음.
      for (const id of affectedLocalIds) {
        keysToDelete.push(`local-elections:local-2026:candidate:${id}`);
      }
      for (const id of affectedByIds) {
        keysToDelete.push(`elections:2026-06-03:candidate:${id}`);
      }
      try {
        const BATCH = 50;
        let removed = 0;
        for (let i = 0; i < keysToDelete.length; i += BATCH) {
          const slice = keysToDelete.slice(i, i + BATCH);
          if (slice.length > 0) {
            const n = await redis.del(...slice);
            removed += n;
          }
        }
        console.log(
          `[OpengirokImport] Redis 캐시 무효화: ${removed}/${keysToDelete.length}개 키 삭제`,
        );
      } catch (e) {
        console.warn(`[OpengirokImport] ⚠ Redis 무효화 실패(무시): ${(e as Error).message}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
