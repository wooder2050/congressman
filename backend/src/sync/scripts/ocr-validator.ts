/**
 * OCR 결과 JSON validator — import-ocr-assets.ts와 단위 테스트가 공유
 *
 * 검증 항목:
 *   - table은 enum ('localElectionCandidate' | 'candidate')
 *   - category는 ALLOWED_CATEGORIES enum
 *   - relation은 ALLOWED_RELATIONS enum
 *   - 금액은 정수 문자열만 허용 (/^-?\d+$/), BigInt로 변환
 *   - 날짜는 YYYY-MM-DD, URL은 http(s)://
 *   - 어떤 항목 실패 시 ValidationError throw
 */

const ALLOWED_TABLES = ['localElectionCandidate', 'candidate'] as const;
export type OcrTable = (typeof ALLOWED_TABLES)[number];

/** NEC 재산신고서 표준 카테고리 + 흔히 보이는 변형 */
export const ALLOWED_CATEGORIES = new Set([
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

export const ALLOWED_RELATIONS = new Set([
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

export interface RawInput {
  candidates?: unknown;
}

export interface ValidatedItem {
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

export interface ValidatedCandidate {
  table: OcrTable;
  id: number;
  name: string;
  sourceDate: string | null;
  sourceUrl: string | null;
  items: ValidatedItem[];
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function vMoney(v: unknown, field: string, allowNegative = true): bigint | null {
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

export function vString(
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

export function validateInput(raw: RawInput): ValidatedCandidate[] {
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
    if (!ALLOWED_TABLES.includes(table as OcrTable)) {
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
      table: table as OcrTable,
      id: c.id,
      name,
      sourceDate,
      sourceUrl,
      items: validatedItems,
    });
  }

  return result;
}
