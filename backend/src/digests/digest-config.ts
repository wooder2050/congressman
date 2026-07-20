/**
 * Lawmake Radar 다이제스트 배치 설정 로딩(환경변수 → config).
 * 안전 기본값: 발송 mode는 지정 없으면 DRY_RUN, 캡은 90(Resend 일 100 한도 여유).
 */

import { createClient } from '@supabase/supabase-js';
import type { DigestSendConfig } from './digest-send.service';
import type { EmailLookup } from './digest-send.service';

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
  if ((mode === 'LIVE' || mode === 'ALLOWLIST') && linkSecret.length < 16) {
    throw new Error('RADAR_LINK_SECRET (>=16 chars) required for LIVE/ALLOWLIST send');
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
 * SUPABASE_URL·SERVICE_ROLE_KEY 없으면 항상 null 반환(발송 대상 없음 → SUPPRESSED).
 */
export function createSupabaseEmailLookup(): EmailLookup {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('[Digest] SUPABASE_URL/SERVICE_ROLE_KEY missing → email lookup disabled');
    return async () => null;
  }
  const supabase = createClient(url, key);
  return async (userId: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !data?.user) return null;
    // 이메일 미확인 사용자는 발송 대상에서 제외(스팸·바운스 방지).
    if (!data.user.email || !data.user.email_confirmed_at) return null;
    return data.user.email;
  };
}
