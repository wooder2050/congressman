import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * NEC 재산신고서 OCR 결과 → CandidateAssetItem 적재
 *
 * 사용법:
 *   pnpm tsx backend/src/sync/scripts/import-ocr-assets.ts <ocr-result.json>
 *
 * 입력 JSON 형식:
 * {
 *   "candidates": [
 *     {
 *       "table": "localElectionCandidate" | "candidate",
 *       "id": 8466,
 *       "name": "김태흠",
 *       "sourceDate": "2026-05-14",
 *       "sourceUrl": "https://info.nec.go.kr/...",
 *       "items": [
 *         {
 *           "category": "토지",                                  // ALLOWED_CATEGORIES 중 하나
 *           "subCategory": "전",                                  // optional
 *           "relation": "본인",                                   // ALLOWED_RELATIONS 중 하나
 *           "description": "충청남도 보령시 ...",
 *           "currentValue": "25807000",                          // 원 단위 문자열 (정수, 음수 허용)
 *           "marketPrice": null,
 *           "changeReason": null
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * 검증 (codex #4):
 *   - table은 enum
 *   - category는 ALLOWED_CATEGORIES enum (NEC 신고 14개 표준 + 자동차 등)
 *   - relation은 ALLOWED_RELATIONS enum
 *   - 금액은 문자열만 허용, /^-?\d+$/ 검증 (codex #5)
 *   - description, name 비어있으면 거부
 *   - 어떤 항목 하나라도 검증 실패 시 전체 import 중단 (--lenient로 우회 가능)
 *
 * Idempotency (codex #3):
 *   - 같은 (candidate, source) 조합의 모든 기존 행을 sourceDate와 무관하게 삭제 후 재삽입
 */

// ============ 검증 enum ============

const ALLOWED_TABLES = ['localElectionCandidate', 'candidate'] as const;
type Table = (typeof ALLOWED_TABLES)[number];

/** NEC 재산신고서 표준 카테고리 + 흔히 보이는 변형 */
const ALLOWED_CATEGORIES = new Set([
  '토지',
  '건물',
  '현금',
  '예금',
  '증권',
  '채권',
  '채무',
  '회원권',
  '보석류',
  '골동품·예술품',
  '골동품 및 예술품',
  '금 및 백금',
  '지식재산권',
  '가상자산',
  '합명·합자·유한회사 출자지분',
  '비영리법인에 출연한 재산',
  '정치자금법에 따른 정치자금의 수입 및 지출을 위한 예금계좌의 예금',
  '고지거부 및 등록제외사항',
  '부동산에 관한 규정이 준용되는 권리와 자동차·건설기계·선박 및 항공기',
]);

const ALLOWED_RELATIONS = new Set([
  '본인',
  '배우자',
  '부',
  '모',
  '장남',
  '차남',
  '삼남',
  '장녀',
  '차녀',
  '삼녀',
  '손자1',
  '손자2',
  '손녀1',
  '손녀2',
  '조모',
  '조부',
]);

const MONEY_PATTERN = /^-?\d+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /^https?:\/\//;

// ============ 입력 타입 (raw — 검증 전) ============

interface RawItem {
  category?: unknown;
  subCategory?: unknown;
  relation?: unknown;
  description?: unknown;
  currentValue?: unknown;
  previousValue?: unknown;
  increaseValue?: unknown;
  decreaseValue?: unknown;
  marketPrice?: unknown;
  changeReason?: unknown;
}

interface RawCandidate {
  table?: unknown;
  id?: unknown;
  name?: unknown;
  sourceDate?: unknown;
  sourceUrl?: unknown;
  items?: unknown;
}

interface RawInput {
  candidates?: unknown;
}

// ============ 검증된 타입 ============

interface ValidatedItem {
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

interface ValidatedCandidate {
  table: Table;
  id: number;
  name: string;
  sourceDate: string | null;
  sourceUrl: string | null;
  items: ValidatedItem[];
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function vMoney(v: unknown, field: string, allowNegative = true): bigint | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v !== 'string') {
    throw new ValidationError(`${field}: 금액은 문자열이어야 합니다 (받은 타입: ${typeof v})`);
  }
  if (!MONEY_PATTERN.test(v)) {
    throw new ValidationError(`${field}: 정수 문자열 형식이 아닙니다 (받은 값: "${v}")`);
  }
  const n = BigInt(v);
  if (!allowNegative && n < BigInt(0)) {
    throw new ValidationError(`${field}: 음수 불허 (받은 값: ${v})`);
  }
  return n;
}

function vString(
  v: unknown,
  field: string,
  opts: { optional?: boolean; max?: number } = {},
): string {
  if (v === null || v === undefined || v === '') {
    if (opts.optional) return '';
    throw new ValidationError(`${field}: 필수 문자열`);
  }
  if (typeof v !== 'string') {
    throw new ValidationError(`${field}: 문자열이어야 합니다 (받은 타입: ${typeof v})`);
  }
  if (opts.max && v.length > opts.max) {
    throw new ValidationError(`${field}: ${opts.max}자 초과 (${v.length}자)`);
  }
  return v;
}

function validateInput(raw: RawInput): ValidatedCandidate[] {
  if (!raw || typeof raw !== 'object') {
    throw new ValidationError('root: 객체가 아닙니다');
  }
  if (!Array.isArray(raw.candidates)) {
    throw new ValidationError('candidates: 배열이어야 합니다');
  }

  const result: ValidatedCandidate[] = [];
  for (let ci = 0; ci < raw.candidates.length; ci++) {
    const c = raw.candidates[ci] as RawCandidate;
    const ctx = `candidates[${ci}]`;

    const table = vString(c.table, `${ctx}.table`);
    if (!ALLOWED_TABLES.includes(table as Table)) {
      throw new ValidationError(`${ctx}.table: 허용되지 않은 값 "${table}"`);
    }

    if (typeof c.id !== 'number' || !Number.isInteger(c.id) || c.id <= 0) {
      throw new ValidationError(`${ctx}.id: 양의 정수여야 합니다 (받은 값: ${c.id})`);
    }

    const name = vString(c.name, `${ctx}.name`, { max: 50 });

    let sourceDate: string | null = null;
    if (c.sourceDate !== undefined && c.sourceDate !== null && c.sourceDate !== '') {
      sourceDate = vString(c.sourceDate, `${ctx}.sourceDate`);
      if (!DATE_PATTERN.test(sourceDate)) {
        throw new ValidationError(`${ctx}.sourceDate: YYYY-MM-DD 형식이 아닙니다`);
      }
    }

    let sourceUrl: string | null = null;
    if (c.sourceUrl !== undefined && c.sourceUrl !== null && c.sourceUrl !== '') {
      sourceUrl = vString(c.sourceUrl, `${ctx}.sourceUrl`);
      if (!URL_PATTERN.test(sourceUrl)) {
        throw new ValidationError(`${ctx}.sourceUrl: http(s)://로 시작해야 합니다`);
      }
    }

    if (!Array.isArray(c.items)) {
      throw new ValidationError(`${ctx}.items: 배열이어야 합니다`);
    }

    const validatedItems: ValidatedItem[] = [];
    for (let ii = 0; ii < c.items.length; ii++) {
      const item = c.items[ii] as RawItem;
      const itemCtx = `${ctx}.items[${ii}]`;

      const category = vString(item.category, `${itemCtx}.category`, { max: 100 });
      if (!ALLOWED_CATEGORIES.has(category)) {
        throw new ValidationError(
          `${itemCtx}.category: 허용되지 않은 카테고리 "${category}" (허용: ${[...ALLOWED_CATEGORIES].slice(0, 5).join(', ')}...)`,
        );
      }

      const relation = vString(item.relation, `${itemCtx}.relation`, { max: 20 });
      if (!ALLOWED_RELATIONS.has(relation)) {
        throw new ValidationError(
          `${itemCtx}.relation: 허용되지 않은 관계 "${relation}" (허용: ${[...ALLOWED_RELATIONS].slice(0, 5).join(', ')}...)`,
        );
      }

      const description = vString(item.description, `${itemCtx}.description`, { max: 1000 });
      const subCategory =
        item.subCategory === undefined || item.subCategory === null
          ? null
          : vString(item.subCategory, `${itemCtx}.subCategory`, { max: 100 });
      const changeReason =
        item.changeReason === undefined || item.changeReason === null
          ? null
          : vString(item.changeReason, `${itemCtx}.changeReason`, { max: 200 });

      validatedItems.push({
        category,
        subCategory,
        relation,
        description,
        currentValue: vMoney(item.currentValue, `${itemCtx}.currentValue`),
        previousValue: vMoney(item.previousValue, `${itemCtx}.previousValue`),
        increaseValue: vMoney(item.increaseValue, `${itemCtx}.increaseValue`, false),
        decreaseValue: vMoney(item.decreaseValue, `${itemCtx}.decreaseValue`, false),
        marketPrice: vMoney(item.marketPrice, `${itemCtx}.marketPrice`),
        changeReason,
      });
    }

    result.push({
      table: table as Table,
      id: c.id,
      name,
      sourceDate,
      sourceUrl,
      items: validatedItems,
    });
  }

  return result;
}

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: pnpm tsx ... <ocr-result.json>');
    process.exit(1);
  }
  const resolvedPath = path.resolve(jsonPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');
  let parsed: RawInput;
  try {
    parsed = JSON.parse(raw) as RawInput;
  } catch (e) {
    console.error(`JSON parse failed: ${(e as Error).message}`);
    process.exit(1);
  }

  let candidates: ValidatedCandidate[];
  try {
    candidates = validateInput(parsed);
  } catch (e) {
    console.error(`✗ Validation failed: ${(e as Error).message}`);
    process.exit(1);
  }
  console.log(
    `✓ Validated ${candidates.length} candidates, ${candidates.reduce((s, c) => s + c.items.length, 0)} items`,
  );

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    let totalInserted = 0;
    let totalDeleted = 0;

    for (const cand of candidates) {
      // Idempotency 강화 (codex #3): 같은 (candidate, source) 모든 기존 행 삭제
      const deleteWhere: Record<string, unknown> = { source: 'nec_ocr_vision' };
      if (cand.table === 'localElectionCandidate') {
        deleteWhere.localCandidateId = cand.id;
      } else {
        deleteWhere.byCandidateId = cand.id;
      }
      const deleted = await prisma.candidateAssetItem.deleteMany({ where: deleteWhere });
      totalDeleted += deleted.count;

      for (const item of cand.items) {
        await prisma.candidateAssetItem.create({
          data: {
            localCandidateId: cand.table === 'localElectionCandidate' ? cand.id : null,
            byCandidateId: cand.table === 'candidate' ? cand.id : null,
            category: item.category,
            subCategory: item.subCategory,
            relation: item.relation,
            description: item.description,
            currentValue: item.currentValue,
            previousValue: item.previousValue,
            increaseValue: item.increaseValue,
            decreaseValue: item.decreaseValue,
            marketPrice: item.marketPrice,
            changeReason: item.changeReason,
            source: 'nec_ocr_vision',
            sourceUrl: cand.sourceUrl,
            sourceDate: cand.sourceDate,
            rawJson: item as object,
          },
        });
        totalInserted++;
      }
      console.log(
        `${cand.name} (${cand.table}/${cand.id}): ${cand.items.length} items (deleted ${deleted.count} prior)`,
      );
    }

    console.log(`\nTotal inserted: ${totalInserted}, deleted (prior): ${totalDeleted}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
