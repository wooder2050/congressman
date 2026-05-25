import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

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

function parseWonFromThousands(text: string | undefined | null): bigint | null {
  if (!text) return null;
  // 숫자·마이너스만 추출 (괄호·따옴표·콤마·공백 등 모두 제거)
  const cleaned = text.replace(/[^0-9-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '0') return null;
  try {
    return BigInt(cleaned) * BigInt(1000);
  } catch {
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

function getNum(row: Row, candidates: string[]): bigint | null {
  const k = findKey(row, candidates);
  return k ? parseWonFromThousands(row[k]) : null;
}

function parseRow(row: Row, format: '2024' | '2025' | '2024-change'): ParsedAsset | null {
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
      currentValue: getNum(row, ['가액']),
      previousValue: null,
      increaseValue: null,
      decreaseValue: null,
      marketPrice: getNum(row, ['실거래가격']),
      changeReason: get(row, ['비고']) || null,
    };
  }
  // 2025 또는 2024-change (모두 변동 컬럼 보유)
  return {
    ...base,
    currentValue: getNum(row, ['현재가액']),
    previousValue: getNum(row, ['종전가액']),
    increaseValue: getNum(row, ['증가액']),
    decreaseValue: getNum(row, ['감소액']),
    marketPrice:
      getNum(row, ['증가액실거래가격', '증가액_실거래가격']) ??
      getNum(row, ['감소액실거래가격', '감소액_실거래가격']),
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
 * 동명이인 위험 회피: birthDate(YYYYMMDD) 일치 필수
 */
async function buildCandidateMap(prisma: PrismaClient): Promise<Map<string, CandidateMatch[]>> {
  // 22대 의원 (Member + MemberTerm.termId=22)
  const members = await prisma.member.findMany({
    where: { memberTerms: { some: { termId: 22 } } },
    select: { name: true, birthDate: true },
  });
  console.log(`[OpengirokImport] 22대 의원: ${members.length}명`);

  const byName = new Map<string, { name: string; bdYmd: string }>();
  for (const m of members) {
    if (!m.birthDate) continue;
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

  try {
    const candidateMap = await buildCandidateMap(prisma);

    let processed = 0;
    let matched = 0;
    let inserted = 0;
    const unmatchedNames = new Set<string>();

    for (const row of records) {
      if (!isAssemblyMember(row, format)) continue;
      processed++;
      const parsed = parseRow(row, format);
      if (!parsed || !parsed.category || !parsed.relation) continue;

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
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
