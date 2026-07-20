import { describe, it, expect } from 'vitest';
import { createLinkToken, verifyLinkToken } from './link-token';

const SECRET = 'test-secret-at-least-32-bytes-long-xxxxx';

describe('link-token', () => {
  it('생성한 토큰은 같은 secret·purpose로 검증된다', () => {
    const token = createLinkToken(SECRET, 'click', 'item123', 3600, 1000);
    const r = verifyLinkToken(SECRET, token, 'click', 1000);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.purpose).toBe('click');
      expect(r.opaqueId).toBe('item123');
    }
  });

  it('만료된 토큰은 거부', () => {
    const token = createLinkToken(SECRET, 'click', 'item123', 3600, 1000);
    const r = verifyLinkToken(SECRET, token, 'click', 1000 + 3601);
    expect(r).toEqual({ ok: false, reason: 'expired' });
  });

  it('다른 secret으로 서명 검증 실패', () => {
    const token = createLinkToken(SECRET, 'click', 'item123', 3600, 1000);
    const r = verifyLinkToken('another-secret-at-least-32-bytes-longg', token, 'click', 1000);
    expect(r).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('purpose 불일치는 거부(클릭 토큰을 수신거부로 검증)', () => {
    const token = createLinkToken(SECRET, 'click', 'item123', 3600, 1000);
    const r = verifyLinkToken(SECRET, token, 'unsubscribe', 1000);
    expect(r).toEqual({ ok: false, reason: 'bad_purpose' });
  });

  it('변조된 opaqueId는 서명 실패', () => {
    const token = createLinkToken(SECRET, 'click', 'item123', 3600, 1000);
    const tampered = token.replace('item123', 'item999');
    const r = verifyLinkToken(SECRET, tampered, 'click', 1000);
    expect(r.ok).toBe(false);
  });

  it('형식이 깨진 토큰은 malformed', () => {
    expect(verifyLinkToken(SECRET, 'garbage', 'click', 1000)).toEqual({
      ok: false,
      reason: 'malformed',
    });
    expect(verifyLinkToken(SECRET, 'v1.click.id.123', 'click', 1000)).toEqual({
      ok: false,
      reason: 'malformed',
    });
  });

  it('secret이 너무 짧으면 생성 거부', () => {
    expect(() => createLinkToken('short', 'click', 'id', 3600)).toThrow();
  });

  it('unsubscribe purpose도 동작', () => {
    const token = createLinkToken(SECRET, 'unsubscribe', 'digest456', 86400, 2000);
    const r = verifyLinkToken(SECRET, token, 'unsubscribe', 2000);
    expect(r.ok && r.opaqueId).toBe('digest456');
  });
});
