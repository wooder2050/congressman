/**
 * Lawmake Radar 다이제스트 배치 설정 로딩(환경변수 → config).
 * 안전 기본값: 발송 mode는 지정 없으면 DRY_RUN, 캡은 90(Resend 일 100 한도 여유).
 */

import { createClient } from '@supabase/supabase-js';
import type { DigestSendConfig, EmailLookup, EmailLookupResult } from './digest-send.service';

const DAY = 24 * 60 * 60;

/** RADAR_DIGEST_ENABLED=true여야 배치가 동작(기본 OFF). */
export function isDigestEnabled(): boolean {
  return process.env.RADAR_DIGEST_ENABLED === 'true';
}

export function loadSendConfig(): DigestSendConfig {
  const rawMode = (process.env.RADAR_EMAIL_MODE ?? 'DRY_RUN').toUpperCase();
  const mode: DigestSendConfig['mode'] =
    rawMode === 'LIVE' || rawMode === 'ALLOWLIST' ? rawMode : 'DRY_RUN';

  const allowlist = new Set(
    (process.env.RADAR_EMAIL_ALLOWLIST ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

  const maxEmailsPerRun = Number.parseInt(process.env.MAX_EMAILS_PER_RUN ?? '90', 10);
  const linkSecret = process.env.RADAR_LINK_SECRET ?? '';
  // 실발송 모드는 시크릿·API 키가 반드시 있어야 한다. 없으면 시작 실패(Noop으로 조용히 SENT
  // 기록되는 것 방지). 원 mode를 config에 담아 어댑터/발송기가 Noop 오작동을 잡을 수 있게 한다.
  if (mode === 'LIVE' || mode === 'ALLOWLIST') {
    if (linkSecret.length < 16) {
      throw new Error('RADAR_LINK_SECRET (>=16 chars) required for LIVE/ALLOWLIST send');
    }
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY required for LIVE/ALLOWLIST send');
    }
  }

  return {
    mode,
    allowlist,
    maxEmailsPerRun: Number.isFinite(maxEmailsPerRun) && maxEmailsPerRun > 0 ? maxEmailsPerRun : 90,
    linkSecret,
    apiBaseUrl: (process.env.RADAR_API_BASE_URL ?? 'https://api.lawmake.kr').replace(/\/$/, ''),
    managementUrl: process.env.RADAR_MANAGEMENT_URL ?? 'https://www.lawmake.kr/alerts',
    clickTtlSeconds: 30 * DAY,
    unsubscribeTtlSeconds: 90 * DAY,
  };
}

/**
 * Supabase auth admin으로 userId → 이메일 조회하는 EmailLookup을 만든다.
 * 오류를 구분한다:
 * - 설정 누락(URL/KEY 없음) → 팩토리에서 throw(시작 실패). 미발송을 조용히 SUPPRESSED하지 않음.
 * - 일시 오류(네트워크·API error) → { kind: 'retry' }(다음 run 재시도).
 * - 이메일 없음·미확인 → { kind: 'no_email' }(SUPPRESSED 종결).
 */
export function createSupabaseEmailLookup(): EmailLookup {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY required for digest send');
  }
  const supabase = createClient(url, key);
  return async (userId): Promise<EmailLookupResult> => {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      if (error) {
        const status = (error as { status?: number }).status;
        // 401/403: 키·권한 문제 → 배치 전체를 멈춰야 함(모든 사용자에 동일 실패). throw.
        if (status === 401 || status === 403) {
          throw new Error(`Supabase auth admin unauthorized (${status}): ${error.message}`);
        }
        // 404/사용자 없음: 영구 → no_email(재시도해도 무의미, SUPPRESSED 종결).
        if (status === 404) return { kind: 'no_email' };
        // 429·5xx·기타: 일시 오류 → 재시도.
        return { kind: 'retry', reason: `${status ?? '?'} ${error.message}` };
      }
      const user = data?.user;
      if (!user) return { kind: 'no_email' }; // 사용자 자체가 없으면 재시도해도 무의미
      // 이메일 미확인은 발송 대상 제외(스팸·바운스 방지).
      if (!user.email || !user.email_confirmed_at) return { kind: 'no_email' };
      return { kind: 'found', email: user.email };
    } catch (e) {
      // 401/403은 위에서 throw → 배치 실패로 전파. 그 외 네트워크 예외는 재시도.
      if (e instanceof Error && /unauthorized \(40[13]\)/.test(e.message)) throw e;
      return { kind: 'retry', reason: e instanceof Error ? e.message : String(e) };
    }
  };
}
