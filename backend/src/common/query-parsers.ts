interface ParseIntOptions {
  defaultValue?: number;
  min?: number;
  max?: number;
}

export function parseOptionalInt(
  value: string | undefined,
  options: ParseIntOptions = {},
): number | undefined {
  const { defaultValue, min, max } = options;
  const parsed = parseInt(value ?? '', 10) || defaultValue;
  if (parsed === undefined) return undefined;
  let result = parsed;
  if (min !== undefined) result = Math.max(result, min);
  if (max !== undefined) result = Math.min(result, max);
  return result;
}

export function parseTermId(value: string | undefined, defaultValue = 22): number {
  return parseInt(value ?? '', 10) || defaultValue;
}

export function parseClampedTermId(value: string | undefined, defaultValue = 22): number {
  return Math.min(Math.max(parseInt(value ?? '', 10) || defaultValue, 1), 30);
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
  return {
    page: Math.max(parseInt(page ?? '', 10) || defaultPage, 1),
    limit: Math.min(Math.max(parseInt(limit ?? '', 10) || defaultLimit, minLimit), maxLimit),
  };
}

interface ClampedIntOptions {
  defaultValue: number;
  min: number;
  max: number;
}

export function parseClampedInt(value: string | undefined, options: ClampedIntOptions): number {
  const { defaultValue, min, max } = options;
  return Math.min(Math.max(parseInt(value ?? '', 10) || defaultValue, min), max);
}
