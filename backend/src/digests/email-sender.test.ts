import { describe, it, expect, vi, afterEach } from 'vitest';
import { NoopEmailSender, ResendEmailSender } from './email-sender';

const input = {
  to: 'user@example.com',
  subject: '제목',
  html: '<p>본문</p>',
  idempotencyKey: 'run1:userA',
  unsubscribeUrl: 'https://api.lawmake.kr/email/unsubscribe/tok',
};

describe('NoopEmailSender', () => {
  it('발송 없이 성공 반환', async () => {
    const r = await new NoopEmailSender().send(input);
    expect(r).toEqual({ ok: true, providerMessageId: null });
  });
});

describe('ResendEmailSender', () => {
  afterEach(() => vi.restoreAllMocks());

  it('성공 시 providerMessageId 반환 + Idempotency-Key·List-Unsubscribe 헤더', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _opts: RequestInit): Promise<Response> =>
        new Response(JSON.stringify({ id: 'msg_123' }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const r = await new ResendEmailSender('key', 'from@lawmake.kr').send(input);
    expect(r).toEqual({ ok: true, providerMessageId: 'msg_123' });

    const opts = fetchMock.mock.calls[0][1];
    const headers = opts.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe('radar-digest/run1:userA');
    const body = JSON.parse(opts.body as string);
    expect(body.headers['List-Unsubscribe']).toContain('unsubscribe/tok');
  });

  it('429는 재시도 가능 실패', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('rate limited', { status: 429 })),
    );
    const r = await new ResendEmailSender('key', 'from@lawmake.kr').send(input);
    expect(r).toEqual({ ok: false, retryable: true, error: expect.stringContaining('429') });
  });

  it('4xx(주소 오류)는 재시도 불가', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('invalid', { status: 422 })),
    );
    const r = await new ResendEmailSender('key', 'from@lawmake.kr').send(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.retryable).toBe(false);
  });

  it('네트워크 예외는 재시도 가능', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const r = await new ResendEmailSender('key', 'from@lawmake.kr').send(input);
    expect(r).toEqual({ ok: false, retryable: true, error: 'network down' });
  });
});
