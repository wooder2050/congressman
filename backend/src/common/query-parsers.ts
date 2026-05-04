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
  const { defaultPage = 1, defaultLimit = 20, minLimit = 1, maxLimit = 100 } = options;
  const parsedLimit = parseIntOrUndefined(limit) ?? defaultLimit;
  return {
    page: parsePage(page, defaultPage),
    limit: Math.min(Math.max(parsedLimit, minLimit), maxLimit),
  };
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
