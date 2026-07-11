import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssemblyApiService, AssemblyApiError } from './assembly-api.service';

const ENDPOINT = 'testendpoint';

/** 정상 응답 페이지 하나를 만든다 */
function okPage(rows: unknown[], totalCount: number) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      [ENDPOINT]: [
        { head: [{ list_total_count: totalCount }, { RESULT: { CODE: 'INFO-000' } }] },
        { row: rows },
      ],
    }),
  };
}

function infoPage(code: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      [ENDPOINT]: [{ head: [{}, { RESULT: { CODE: code } }] }],
    }),
  };
}

describe('AssemblyApiService.fetchAll', () => {
  let svc: AssemblyApiService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.ASSEMBLY_API_KEY = 'test-key';
    svc = new AssemblyApiService();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // 정상: 단일 페이지 완전 수집
  it('단일 페이지를 완전히 수집한다', async () => {
    fetchMock.mockResolvedValueOnce(okPage([{ a: 1 }, { a: 2 }], 2));
    const rows = await svc.fetchAll(ENDPOINT, {}, 100);
    expect(rows).toHaveLength(2);
  });

  // 정상: 여러 페이지
  it('여러 페이지를 이어붙여 수집한다', async () => {
    fetchMock
      .mockResolvedValueOnce(okPage([{ a: 1 }, { a: 2 }], 3))
      .mockResolvedValueOnce(okPage([{ a: 3 }], 3));
    const rows = await svc.fetchAll(ENDPOINT, {}, 2);
    expect(rows).toHaveLength(3);
  });

  // 정상 no-data: 첫 페이지 INFO-200
  it('첫 페이지 INFO-200이면 빈 배열을 반환한다', async () => {
    fetchMock.mockResolvedValueOnce(infoPage('INFO-200'));
    const rows = await svc.fetchAll(ENDPOINT, {}, 100);
    expect(rows).toEqual([]);
  });

  // 정상 0건: list_total_count=0
  it('list_total_count=0이면 빈 배열을 반환한다', async () => {
    fetchMock.mockResolvedValueOnce(okPage([], 0));
    const rows = await svc.fetchAll(ENDPOINT, {}, 100);
    expect(rows).toEqual([]);
  });

  // 오류: HTTP 500 (재시도 소진 후 실패)
  it('HTTP 500이 지속되면 예외를 던진다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow();
  });

  // 오류: HTTP 500 후 복구되면 성공 (재시도 검증)
  it('HTTP 500 후 재시도로 복구되면 성공한다', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce(okPage([{ a: 1 }], 1));
    const rows = await svc.fetchAll(
      ENDPOINT,
      {},
      {
        pageSize: 100,
        maxRetries: 2,
        requestTimeoutMs: 1000,
      },
    );
    expect(rows).toHaveLength(1);
  });

  // 오류: 4xx는 즉시 실패 (재시도 안 함)
  it('HTTP 400은 재시도 없이 즉시 실패한다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400, json: async () => ({}) });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(AssemblyApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // 오류: invalid JSON (재시도 후 실패)
  it('JSON이 아닌 응답이면 예외를 던진다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('invalid json');
      },
    });
    await expect(
      svc.fetchAll(ENDPOINT, {}, { pageSize: 100, maxRetries: 1, requestTimeoutMs: 1000 }),
    ).rejects.toThrow();
  });

  // 오류: 구조 이상 (row 없음, INFO-200 아님)
  it('예상 구조가 아니면(첫 페이지 비-INFO-200) 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ [ENDPOINT]: [{ head: [{}, { RESULT: { CODE: 'ERROR-300' } }] }] }),
    });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(AssemblyApiError);
  });

  // 오류: 중간 페이지 INFO-200 (모순된 페이지네이션)
  it('중간 페이지에서 INFO-200이 나오면 예외를 던진다', async () => {
    fetchMock
      .mockResolvedValueOnce(okPage([{ a: 1 }], 3)) // total 3인데 1건만 옴
      .mockResolvedValueOnce(infoPage('INFO-200')); // 다음 페이지가 no-data → 모순
    await expect(svc.fetchAll(ENDPOINT, {}, 1)).rejects.toThrow(AssemblyApiError);
  });

  // 오류: 페이지 간 list_total_count 변경
  it('페이지 간 list_total_count가 바뀌면 예외를 던진다', async () => {
    fetchMock
      .mockResolvedValueOnce(okPage([{ a: 1 }], 3))
      .mockResolvedValueOnce(okPage([{ a: 2 }], 5)); // total 3→5
    await expect(svc.fetchAll(ENDPOINT, {}, 1)).rejects.toThrow(/list_total_count changed/);
  });

  // 오류: 최종 수집량 부족 (마지막 페이지가 빈 배열)
  it('완료 전 빈 페이지가 나오면 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce(okPage([{ a: 1 }], 3)).mockResolvedValueOnce(okPage([], 3)); // 아직 3건 못 모았는데 빈 페이지
    await expect(svc.fetchAll(ENDPOINT, {}, 1)).rejects.toThrow(/empty page before completion/);
  });

  // 오류: 수집량이 total 초과
  it('수집량이 list_total_count를 초과하면 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce(okPage([{ a: 1 }, { a: 2 }, { a: 3 }], 2)); // total 2인데 3건
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(/exceeds list_total_count/);
  });

  // 오류: list_total_count 타입 이상
  it('list_total_count가 숫자가 아니면 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        [ENDPOINT]: [
          { head: [{ list_total_count: 'oops' }, { RESULT: { CODE: 'INFO-000' } }] },
          { row: [{ a: 1 }] },
        ],
      }),
    });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(/invalid list_total_count/);
  });

  // 오류: 첫 페이지 INFO-200인데 데이터가 동반된 모순
  it('INFO-200인데 row 데이터가 있으면 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        [ENDPOINT]: [
          { head: [{ list_total_count: 5 }, { RESULT: { CODE: 'INFO-200' } }] },
          { row: [{ a: 1 }] },
        ],
      }),
    });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(/contradictory INFO-200/);
  });

  // 오류: ERROR-* 결과 코드는 구조가 정상이어도 실패
  it('ERROR 결과 코드는 구조가 정상이어도 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        [ENDPOINT]: [
          { head: [{ list_total_count: 1 }, { RESULT: { CODE: 'ERROR-300' } }] },
          { row: [{ a: 1 }] },
        ],
      }),
    });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(/result code ERROR-300/);
  });

  // 오류: list_total_count=0인데 row가 동반된 모순
  it('list_total_count=0인데 row가 있으면 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        [ENDPOINT]: [
          { head: [{ list_total_count: 0 }, { RESULT: { CODE: 'INFO-000' } }] },
          { row: [{ a: 1 }] },
        ],
      }),
    });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(/rows present/);
  });

  // 오류: body(res.json())가 멈추면 timeout이 signal을 abort해 예외를 던진다 (실제 signal 경로 검증)
  it('body가 멈추면 timeout이 signal을 abort해 예외를 던진다', async () => {
    // fetch는 즉시 응답하지만 res.json()이 signal이 abort될 때까지 pending → 실제 body timeout 경로
    fetchMock.mockImplementation((_url: string, init: { signal: AbortSignal }) => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          new Promise((_resolve, reject) => {
            if (init.signal.aborted) {
              const e = new Error('aborted');
              e.name = 'AbortError';
              reject(e);
              return;
            }
            init.signal.addEventListener('abort', () => {
              const e = new Error('aborted');
              e.name = 'AbortError';
              reject(e);
            });
          }),
      });
    });
    await expect(
      svc.fetchAll(ENDPOINT, {}, { pageSize: 100, maxRetries: 0, requestTimeoutMs: 50 }),
    ).rejects.toThrow(/body error \(body timeout\)/);
  });

  // 오류: INFO-200인데 row가 배열이 아니면(비배열 객체) 구조 오류
  it('row가 배열이 아니면 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        [ENDPOINT]: [
          { head: [{ list_total_count: 1 }, { RESULT: { CODE: 'INFO-200' } }] },
          { row: { a: 1 } },
        ],
      }),
    });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(/row is not an array/);
  });

  // 오류: 결과 코드가 아예 없으면(누락) 거부
  it('result code가 없으면 예외를 던진다', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        [ENDPOINT]: [{ head: [{ list_total_count: 1 }] }, { row: [{ a: 1 }] }],
      }),
    });
    await expect(svc.fetchAll(ENDPOINT, {}, 100)).rejects.toThrow(
      /unexpected API result code none/,
    );
  });
});
