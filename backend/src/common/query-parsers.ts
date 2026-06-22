const DEFAULT_TERM_ID = 22;
const MIN_TERM_ID = 1;
const MAX_TERM_ID = 30;

function parseIntOrUndefined(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// '0' → undefined (필터 미적용으로 취급). 음수/양수는 그대로 통과.
export function parseOptionalIntFilter(value: string | undefined): number | undefined {
  const parsed = parseIntOrUndefined(value);
  if (parsed === undefined || parsed === 0) return undefined;
  return parsed;
}

export function parseTermId(value: string | undefined, defaultValue = DEFAULT_TERM_ID): number {
  return parseIntOrUndefined(value) ?? defaultValue;
}

export function parseClampedTermId(
  value: string | undefined,
  defaultValue = DEFAULT_TERM_ID,
): number {
  const parsed = parseIntOrUndefined(value) ?? defaultValue;
  return Math.min(Math.max(parsed, MIN_TERM_ID), MAX_TERM_ID);
}

export function parsePage(value: string | undefined, defaultValue = 1): number {
  const parsed = parseIntOrUndefined(value) ?? defaultValue;
  return Math.max(parsed, 1);
}

interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  minLimit?: number;
  maxLimit?: number;
  /** 허용 limit 값 화이트리스트. 지정 시 이 목록에 없는 limit은 defaultLimit으로 정규화한다. */
  allowedLimits?: number[];
}

interface Pagination {
  page: number;
  limit: number;
}

export function parsePagination(
  page: string | undefined,
  limit: string | undefined,
  options: PaginationOptions = {},
): Pagination {
  const {
    defaultPage = 1,
    defaultLimit = 20,
    minLimit = 1,
    maxLimit = 100,
    allowedLimits,
  } = options;
  const parsedLimit = parseIntOrUndefined(limit) ?? defaultLimit;
  // 캐시 키 폭발 방지: limit이 화이트리스트에 없으면 기본값으로 정규화해 키 분기를 유한하게 유지
  const limitValue = allowedLimits
    ? allowedLimits.includes(parsedLimit)
      ? parsedLimit
      : defaultLimit
    : Math.min(Math.max(parsedLimit, minLimit), maxLimit);
  return {
    page: parsePage(page, defaultPage),
    limit: limitValue,
  };
}

/**
 * 캐시 키에 page를 포함할지 판단하는 상한.
 * 이 값을 넘는 페이지는 캐시하지 않아(키 폭발 방지), 봇/크롤러가 ?page=N(대형 N)으로
 * Redis 키를 무한 생성하는 것을 막는다. 실제 사용자는 거의 도달하지 않는 깊이.
 */
const CACHE_MAX_PAGE = 20;

/** 주어진 page가 캐시 가능한 범위(1..CACHE_MAX_PAGE)인지 */
export function isCacheablePage(page: number): boolean {
  return page >= 1 && page <= CACHE_MAX_PAGE;
}

interface ClampedIntOptions {
  defaultValue: number;
  min: number;
  max: number;
}

export function parseClampedInt(value: string | undefined, options: ClampedIntOptions): number {
  const { defaultValue, min, max } = options;
  const parsed = parseIntOrUndefined(value) ?? defaultValue;
  return Math.min(Math.max(parsed, min), max);
}
