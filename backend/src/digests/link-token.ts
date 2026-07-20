/**
 * Lawmake Radar 이메일 링크 서명 토큰(HMAC-SHA256).
 *
 * 형식: v1.<purpose>.<opaqueId>.<exp>.<sig>
 * - purpose: "click" | "unsubscribe"
 * - opaqueId: DigestItem.id(click) 또는 Digest.id(unsubscribe). userId/email/URL은 넣지 않음.
 * - exp: 만료 epoch초. 서명 입력에 포함.
 * - sig: HMAC-SHA256(secret, "v1.<purpose>.<opaqueId>.<exp>") base64url.
 *
 * 목적: 로그인 없이 클릭·수신거부를 처리하되, 토큰에 개인정보·리다이렉트 URL을 노출하지 않는다.
 * open redirect 방지를 위해 목적 URL은 서버가 opaqueId로 DB를 조회해 구성한다.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

type LinkPurpose = 'click' | 'unsubscribe';

const VERSION = 'v1';

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sign(secret: string, payload: string): string {
  return base64url(createHmac('sha256', secret).update(payload).digest());
}

/** 서명 토큰 생성. ttlSeconds 후 만료. nowSeconds는 테스트 주입용(기본 현재). */
export function createLinkToken(
  secret: string,
  purpose: LinkPurpose,
  opaqueId: string,
  ttlSeconds: number,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string {
  if (!secret || secret.length < 16) {
    throw new Error('RADAR_LINK_SECRET must be at least 16 chars');
  }
  const exp = nowSeconds + ttlSeconds;
  const payload = `${VERSION}.${purpose}.${opaqueId}.${exp}`;
  return `${payload}.${sign(secret, payload)}`;
}

type VerifyResult =
  | { ok: true; purpose: LinkPurpose; opaqueId: string }
  | { ok: false; reason: 'malformed' | 'bad_signature' | 'expired' | 'bad_purpose' };

/** 토큰 검증. 서명·만료·형식을 확인하고 opaqueId를 돌려준다. timing-safe 비교. */
export function verifyLinkToken(
  secret: string,
  token: string,
  expectedPurpose: LinkPurpose,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): VerifyResult {
  const parts = token.split('.');
  if (parts.length !== 5) return { ok: false, reason: 'malformed' };
  const [version, purpose, opaqueId, expStr, sig] = parts;
  if (version !== VERSION || !opaqueId || !expStr || !sig) {
    return { ok: false, reason: 'malformed' };
  }
  if (purpose !== 'click' && purpose !== 'unsubscribe') {
    return { ok: false, reason: 'malformed' };
  }
  if (purpose !== expectedPurpose) return { ok: false, reason: 'bad_purpose' };

  const payload = `${version}.${purpose}.${opaqueId}.${expStr}`;
  const expected = sign(secret, payload);
  // 길이가 다르면 timingSafeEqual이 throw하므로 먼저 방어
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, reason: 'bad_signature' };
  }

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < nowSeconds) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, purpose, opaqueId };
}
