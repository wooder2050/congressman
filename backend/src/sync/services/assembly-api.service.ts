interface FetchAllOptions {
  /** 페이지당 요청 크기 (기본 100) */
  pageSize?: number;
  /** 요청 1회 timeout(ms, 기본 10000) */
  requestTimeoutMs?: number;
  /** 요청 실패 시 재시도 횟수 (기본 2 = 최대 3회 시도) */
  maxRetries?: number;
  /** fetchAll 전체 deadline(ms). 초과 시 실패. 기본 무제한(Infinity) */
  overallDeadlineMs?: number;
}

/** 국회 API 페이지네이션 관련 오류 (부분 응답을 전체로 오인하지 않도록 명시적으로 실패) */
export class AssemblyApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssemblyApiError';
  }
}

const BASE_URL = 'https://open.assembly.go.kr/portal/openapi';
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 2;
const RATE_LIMIT_DELAY_MS = 100;

export class AssemblyApiService {
  private readonly apiKey: string;

  constructor() {
    const key = process.env.ASSEMBLY_API_KEY;
    if (!key) throw new Error('ASSEMBLY_API_KEY is not set');
    this.apiKey = key;
  }

  /**
   * 국회 API에서 전체 페이지를 순회하며 **완전한 스냅샷을 반환하거나 예외를 던진다.**
   *
   * 부분 응답을 정상 전체 데이터로 반환하지 않는 것이 핵심 계약이다. 아래를 검증한다:
   * - HTTP 2xx (`res.ok`)
   * - JSON 파싱 성공, 응답 구조(endpoint 배열·head·row) 정상
   * - `list_total_count`가 0 이상 정수이며 페이지 간 일관됨
   * - 페이지 진전 여부(빈 페이지로 무한 루프/정체 방지)
   * - 최종 `rows.length === list_total_count`
   *
   * 정상적으로 데이터가 0건인 경우(INFO-200 결과 코드가 첫 페이지에서 수집 전에 확인)에만 빈 배열을 반환한다.
   * 그 외 비정상(HTTP 오류·구조 이상·count 불일치·중간 페이지 오류)은 모두 throw 한다.
   *
   * 삭제 후 재삽입(delete→insert) 패턴을 쓰는 호출부는 이 예외를 반드시 전파해
   * 기존 데이터가 부분 응답으로 삭제되는 것을 막아야 한다.
   */
  async fetchAll<T>(
    endpoint: string,
    params: Record<string, string> = {},
    pageSizeOrOptions: number | FetchAllOptions = 100,
  ): Promise<T[]> {
    const opts: FetchAllOptions =
      typeof pageSizeOrOptions === 'number' ? { pageSize: pageSizeOrOptions } : pageSizeOrOptions;
    const pageSize = opts.pageSize ?? 100;
    const requestTimeoutMs = opts.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;
    const overallDeadlineMs = opts.overallDeadlineMs ?? Infinity;
    const startedAt = Date.now();

    const allRows: T[] = [];
    let pIndex = 1;
    let totalCount: number | null = null;

    while (totalCount === null || allRows.length < totalCount) {
      if (Date.now() - startedAt > overallDeadlineMs) {
        throw new AssemblyApiError(
          `${endpoint}: overall deadline ${overallDeadlineMs}ms exceeded at page ${pIndex} (collected ${allRows.length}/${totalCount ?? '?'})`,
        );
      }

      const url = new URL(`${BASE_URL}/${endpoint}`);
      url.searchParams.set('KEY', this.apiKey);
      url.searchParams.set('Type', 'json');
      url.searchParams.set('pIndex', String(pIndex));
      url.searchParams.set('pSize', String(pageSize));
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }

      console.log(`[API] Fetching ${endpoint} page ${pIndex} ...`);
      const json = await this.fetchPageWithRetry(url.toString(), endpoint, pIndex, {
        requestTimeoutMs,
        maxRetries,
      });

      const data = json[endpoint];
      const resultCode = this.extractResultCode(data);
      const rawRow: unknown = Array.isArray(data) ? data[1]?.row : undefined;
      // row 필드가 존재하지만 배열이 아니면 구조 오류(비배열 객체/문자열 등)
      const rowPresent = Array.isArray(data) && data[1] !== undefined && 'row' in (data[1] ?? {});
      const rowIsArray = Array.isArray(rawRow);
      const hasData = rowIsArray && rawRow.length > 0;

      if (rowPresent && !rowIsArray) {
        throw new AssemblyApiError(
          `${endpoint} page ${pIndex}: row is not an array (resultCode=${resultCode ?? 'none'})`,
        );
      }

      // INFO-200(정상 데이터 없음)은 첫 페이지 + 수집 전 + 데이터 미동반일 때만 no-data로 인정.
      // 데이터가 동반된 INFO-200, 중간 페이지 INFO-200은 모순이므로 오류 처리.
      if (resultCode === 'INFO-200') {
        if (pIndex === 1 && allRows.length === 0 && !hasData) {
          console.log(`[API]   ${endpoint}: no data (INFO-200)`);
          return [];
        }
        throw new AssemblyApiError(
          `${endpoint} page ${pIndex}: contradictory INFO-200 (hasData=${hasData}, collected ${allRows.length}/${totalCount ?? '?'})`,
        );
      }

      // 정상 결과 코드(INFO-000)가 아니면 오류. 코드가 아예 없어도(누락) 거부.
      if (resultCode !== 'INFO-000') {
        throw new AssemblyApiError(
          `${endpoint} page ${pIndex}: unexpected API result code ${resultCode ?? 'none'} (collected ${allRows.length})`,
        );
      }

      // 응답 구조 자체가 없으면 오류
      if (!Array.isArray(data) || !data[0]?.head) {
        throw new AssemblyApiError(
          `${endpoint} page ${pIndex}: unexpected response shape (resultCode=${resultCode ?? 'none'}, collected ${allRows.length})`,
        );
      }

      // list_total_count 검증
      const pageTotal = data[0].head[0]?.list_total_count;
      if (typeof pageTotal !== 'number' || !Number.isInteger(pageTotal) || pageTotal < 0) {
        throw new AssemblyApiError(
          `${endpoint} page ${pIndex}: invalid list_total_count=${String(pageTotal)}`,
        );
      }
      if (totalCount === null) {
        totalCount = pageTotal;
      } else if (pageTotal !== totalCount) {
        throw new AssemblyApiError(
          `${endpoint} page ${pIndex}: list_total_count changed ${totalCount} → ${pageTotal} (pagination inconsistent)`,
        );
      }

      // totalCount=0이면 row가 동반되면 안 됨(모순 검출). 정상 0건만 [] 반환.
      if (totalCount === 0) {
        if (hasData) {
          throw new AssemblyApiError(
            `${endpoint} page ${pIndex}: list_total_count=0 but rows present (contradictory)`,
          );
        }
        console.log(`[API]   ${endpoint}: 0 rows`);
        return [];
      }

      const rows = rawRow;
      if (!Array.isArray(rows)) {
        throw new AssemblyApiError(
          `${endpoint} page ${pIndex}: missing row array (collected ${allRows.length}/${totalCount})`,
        );
      }
      if (rows.length === 0) {
        // 아직 다 못 모았는데 빈 페이지 → 정체(무한 루프 방지)
        throw new AssemblyApiError(
          `${endpoint} page ${pIndex}: empty page before completion (collected ${allRows.length}/${totalCount})`,
        );
      }

      allRows.push(...(rows as T[]));
      console.log(`[API]   Got ${rows.length} rows (total: ${allRows.length}/${totalCount})`);

      if (allRows.length > totalCount) {
        throw new AssemblyApiError(
          `${endpoint}: collected ${allRows.length} exceeds list_total_count ${totalCount}`,
        );
      }

      pIndex++;
      await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY_MS));
    }

    // 최종 완전성 검증
    if (allRows.length !== totalCount) {
      throw new AssemblyApiError(
        `${endpoint}: final count mismatch (collected ${allRows.length}, expected ${totalCount})`,
      );
    }

    // deadline을 넘긴 채로 성공 반환하지 않도록 최종 확인
    if (Date.now() - startedAt > overallDeadlineMs) {
      throw new AssemblyApiError(
        `${endpoint}: completed but exceeded overall deadline ${overallDeadlineMs}ms`,
      );
    }

    return allRows;
  }

  /** 결과 코드(RESULT.CODE)를 응답에서 추출 (구조가 흔들려도 안전하게) */
  private extractResultCode(data: unknown): string | undefined {
    if (!Array.isArray(data)) return undefined;
    const head = (data[0] as { head?: unknown[] })?.head;
    if (!Array.isArray(head)) return undefined;
    for (const h of head) {
      const code = (h as { RESULT?: { CODE?: string } })?.RESULT?.CODE;
      if (typeof code === 'string') return code;
    }
    return undefined;
  }

  /** 단일 페이지를 timeout·재시도와 함께 fetch. 재시도 가능한 오류만 재시도. */
  private async fetchPageWithRetry(
    url: string,
    endpoint: string,
    pIndex: number,
    opts: { requestTimeoutMs: number; maxRetries: number },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      if (attempt > 0) {
        // backoff 500ms, 1500ms (+ jitter). 재시도 로그.
        const backoff = 500 * Math.pow(3, attempt - 1);
        const jitter = Math.floor(Math.random() * 250);
        console.warn(
          `[API]   Retry ${attempt}/${opts.maxRetries} for ${endpoint} page ${pIndex} after ${backoff + jitter}ms`,
        );
        await new Promise((r) => setTimeout(r, backoff + jitter));
      }

      const controller = new AbortController();
      // timeout이 헤더뿐 아니라 body 스트림(res.json())까지 커버하도록 finally에서만 해제한다.
      const timer = setTimeout(() => controller.abort(), opts.requestTimeoutMs);
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: controller.signal,
        });

        if (!res.ok) {
          // 429/5xx/408은 재시도, 그 외 4xx는 즉시 실패
          if (res.status === 429 || res.status === 408 || res.status >= 500) {
            lastErr = new AssemblyApiError(
              `${endpoint} page ${pIndex}: HTTP ${res.status} (retryable)`,
            );
            continue;
          }
          throw new AssemblyApiError(`${endpoint} page ${pIndex}: HTTP ${res.status}`);
        }

        try {
          // res.json()도 controller.signal로 abort되므로 body가 멈추면 timeout이 작동한다.
          return await res.json();
        } catch (jsonErr) {
          // AbortError(body timeout)면 재시도, 그 외(HTML 등 비-JSON)도 재시도
          const reason =
            jsonErr instanceof Error && jsonErr.name === 'AbortError' ? 'body timeout' : 'not JSON';
          lastErr = new AssemblyApiError(
            `${endpoint} page ${pIndex}: response body error (${reason})`,
          );
          continue;
        }
      } catch (err) {
        // AbortError(timeout)·네트워크 오류는 재시도. AssemblyApiError(비재시도 4xx)는 즉시 전파.
        if (err instanceof AssemblyApiError && !err.message.includes('retryable')) {
          throw err;
        }
        lastErr = err;
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new AssemblyApiError(`${endpoint} page ${pIndex}: failed after retries`);
  }
}
