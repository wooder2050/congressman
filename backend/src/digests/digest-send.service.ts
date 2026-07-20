/**
 * Lawmake Radar 주간 다이제스트 '발송' 배치.
 *
 * 역할: 빌드된 Digest(PENDING 또는 재시도 가능한 FAILED)를 이메일로 보낸다.
 * 흐름(사용자당): auth 이메일 조회 → 수신거부·allowlist 필터 → 클릭/수신거부 토큰으로 렌더
 *   → 어댑터 발송 → 상태 갱신(SENT/FAILED/SUPPRESSED).
 *
 * 안전장치:
 * - mode: DRY_RUN(발송·상태변경 없음) / ALLOWLIST(일치 이메일만) / LIVE. 실발송 모드에서
 *   sender가 Noop이면 시작 실패(미발송을 SENT로 오기록 방지).
 * - MAX_EMAILS_PER_RUN: 실제 발송 직전 큐에만 적용. 초과분은 PENDING 유지(다음 run FIFO, 유실X).
 * - snapshot 멱등: 발송 전 subject/html/recipient를 확정 저장, 재시도는 저장된 payload 재사용.
 * - Digest.idempotencyKey로 공급자 중복 발송 방지. SENT는 절대 재발송 안 함.
 * - 이메일 조회 오류 구분: 설정누락 throw / 일시오류 재시도 / 없음·미확인만 SUPPRESSED.
 * - 수신거부(UserPreference.radarEmailOptIn=false)·이메일 없음은 SUPPRESSED.
 */

import type { PrismaClient } from '@prisma/client';
import { createLinkToken } from './link-token';
import { renderHtml, renderSubject, type RenderItem } from './digest-email';
import { type EmailSender, type SendResult } from './email-sender';

/** 재시도 가능 실패도 이 횟수 이상이면 포기(무한 재시도 방지). */
const MAX_ATTEMPTS = 5;

export interface DigestSendConfig {
  mode: 'DRY_RUN' | 'ALLOWLIST' | 'LIVE';
  allowlist: Set<string>; // 정규화된(소문자·trim) 이메일
  maxEmailsPerRun: number;
  linkSecret: string;
  /** 리다이렉트·수신거부 엔드포인트 베이스(예: https://api.lawmake.kr). */
  apiBaseUrl: string;
  /** 관리 화면(예: https://www.lawmake.kr/alerts). */
  managementUrl: string;
  clickTtlSeconds: number; // 클릭 링크 만료(예: 30일)
  unsubscribeTtlSeconds: number; // 수신거부 링크 만료(예: 90일)
}

interface DigestSendResult {
  candidates: number;
  sent: number;
  suppressed: number;
  failed: number;
  skippedByCap: number;
}

/**
 * userId → 이메일 조회 결과(구현 주입: 실제는 Supabase auth admin).
 * - found: 발송 가능한 확인된 이메일.
 * - no_email: 이메일 없음·미확인 → SUPPRESSED(영구 종결).
 * - retry: 일시 오류(네트워크·API) → 이번엔 발송 스킵, 상태 유지(다음 run 재시도).
 * (설정 누락 같은 시작 실패는 lookup이 throw)
 */
export type EmailLookupResult =
  | { kind: 'found'; email: string }
  | { kind: 'no_email' }
  | { kind: 'retry'; reason: string };
export type EmailLookup = (userId: string) => Promise<EmailLookupResult>;

export class DigestSendService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly sender: EmailSender,
    private readonly lookupEmail: EmailLookup,
  ) {}

  async send(config: DigestSendConfig): Promise<DigestSendResult> {
    const result: DigestSendResult = {
      candidates: 0,
      sent: 0,
      suppressed: 0,
      failed: 0,
      skippedByCap: 0,
    };

    // 실발송 모드인데 sender가 Noop이면 시작 실패. (Noop이 성공을 반환해 미발송을 SENT로
    // 오기록하는 것 방지. config 로딩에서 키 검증하지만 어댑터 불일치도 여기서 최종 차단.)
    if (config.mode !== 'DRY_RUN' && this.sender.mode === 'noop') {
      throw new Error(
        `refusing to send in ${config.mode} mode with noop sender (missing RESEND_API_KEY?)`,
      );
    }

    // 발송 대상: READY run의 PENDING + 재시도 가능한 FAILED. 오래된 것부터(FIFO).
    // permanent 실패([permanent] 접두사)와 과다 시도(MAX_ATTEMPTS)는 재시도 제외(무한 재시도 금지).
    const digests = await this.prisma.digest.findMany({
      where: {
        digestRun: { status: 'READY' },
        OR: [
          { status: 'PENDING' },
          {
            status: 'FAILED',
            attemptCount: { lt: MAX_ATTEMPTS },
            NOT: { lastError: { startsWith: '[permanent]' } },
          },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        items: { orderBy: { position: 'asc' } },
      },
    });
    result.candidates = digests.length;

    let sentThisRun = 0;

    for (const digest of digests) {
      // MAX_EMAILS_PER_RUN: 실제 발송 직전에만 적용. 초과분은 손대지 않고 다음 run으로.
      if (config.mode !== 'DRY_RUN' && sentThisRun >= config.maxEmailsPerRun) {
        result.skippedByCap += 1;
        continue;
      }

      const lookup = await this.lookupEmail(digest.userId);
      // 일시 조회 오류: 발송 스킵, 상태 그대로 유지(다음 run 재시도). SUPPRESSED로 종결하지 않음.
      if (lookup.kind === 'retry') continue;
      const normalized = lookup.kind === 'found' ? lookup.email.trim().toLowerCase() : null;

      // 수신거부 확인(UserPreference.radarEmailOptIn=false).
      const pref = await this.prisma.userPreference.findUnique({
        where: { userId: digest.userId },
        select: { radarEmailOptIn: true },
      });
      const optedOut = pref?.radarEmailOptIn === false;

      if (!normalized || optedOut) {
        await this.markSuppressed(digest.id, !normalized ? 'no_email' : 'opted_out');
        result.suppressed += 1;
        continue;
      }

      // ALLOWLIST 모드: 목록에 없으면 SUPPRESSED(다음에 자동 승격 안 함).
      if (config.mode === 'ALLOWLIST' && !config.allowlist.has(normalized)) {
        await this.markSuppressed(digest.id, 'not_in_allowlist');
        result.suppressed += 1;
        continue;
      }

      // snapshot 멱등: 재시도(FAILED)이고 이미 저장된 payload가 있으면 그대로 재사용.
      // 최초면 렌더 후 발송 전에 DB에 확정 저장 → 재시도가 같은 idempotencyKey로 같은 payload 발송.
      const hasSnapshot = !!digest.htmlSnapshot && !!digest.recipientEmail;
      const subject = hasSnapshot ? digest.subjectSnapshot : renderSubject(digest.items.length);
      const html = hasSnapshot
        ? digest.htmlSnapshot
        : this.renderDigestHtml(
            digest.id,
            digest.items.map((it) => this.toRenderItem(it)),
            config,
          );
      const recipient = hasSnapshot ? (digest.recipientEmail as string) : normalized;

      if (config.mode === 'DRY_RUN') {
        // DRY_RUN은 원장을 소비하지 않는 순수 미리보기(빌드에서 PENDING 자체가 안 만들어지지만,
        // 방어적으로 발송·상태변경 없이 카운트만). 여기 도달 시 아무 것도 쓰지 않는다.
        continue;
      }

      // 최초 시도면 발송 전에 snapshot 확정 저장(멱등 보장).
      if (!hasSnapshot) {
        await this.prisma.digest.update({
          where: { id: digest.id },
          data: { subjectSnapshot: subject, htmlSnapshot: html, recipientEmail: recipient },
        });
      }

      const sendResult = await this.sender.send({
        to: recipient,
        subject,
        html,
        idempotencyKey: digest.idempotencyKey,
        unsubscribeUrl: this.unsubscribeUrl(digest.id, config),
      });

      await this.applySendResult(digest.id, sendResult);
      if (sendResult.ok) {
        result.sent += 1;
        sentThisRun += 1;
      } else {
        result.failed += 1;
      }
    }

    return result;
  }

  private toRenderItem(it: { id: string; payloadSnapshot: unknown }): RenderItem {
    const p = (it.payloadSnapshot ?? {}) as {
      billId?: string;
      billTitle?: string;
      billStatus?: string;
      eventType?: string;
      changes?: unknown;
      detectedAt?: string;
      sourceChangedAt?: string | null;
    };
    return {
      id: it.id,
      billId: p.billId ?? '',
      billTitle: p.billTitle ?? '',
      billStatus: p.billStatus ?? '',
      eventType: p.eventType ?? '',
      changes: p.changes ?? [],
      detectedAt: p.detectedAt ? new Date(p.detectedAt) : new Date(0),
      sourceChangedAt: p.sourceChangedAt ?? null,
    };
  }

  private renderDigestHtml(
    digestId: string,
    items: RenderItem[],
    config: DigestSendConfig,
  ): string {
    const clickUrlByItemId = new Map<string, string>();
    for (const it of items) {
      const token = createLinkToken(config.linkSecret, 'click', it.id, config.clickTtlSeconds);
      clickUrlByItemId.set(it.id, `${config.apiBaseUrl}/api/r/c/${token}`);
    }
    return renderHtml({
      items,
      clickUrlByItemId,
      unsubscribeUrl: this.unsubscribeUrl(digestId, config),
      managementUrl: config.managementUrl,
    });
  }

  private unsubscribeUrl(digestId: string, config: DigestSendConfig): string {
    const token = createLinkToken(
      config.linkSecret,
      'unsubscribe',
      digestId,
      config.unsubscribeTtlSeconds,
    );
    return `${config.apiBaseUrl}/api/email/unsubscribe/${token}`;
  }

  private async markSuppressed(digestId: string, reason: string): Promise<void> {
    await this.prisma.digest.update({
      where: { id: digestId },
      data: { status: 'SUPPRESSED', suppressedReason: reason },
    });
  }

  /** 발송 결과로 상태만 갱신(subject/html/email snapshot은 발송 전에 이미 확정 저장됨). */
  private async applySendResult(digestId: string, r: SendResult): Promise<void> {
    if (r.ok) {
      await this.prisma.digest.update({
        where: { id: digestId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          providerMessageId: r.providerMessageId,
          lastAttemptAt: new Date(),
          attemptCount: { increment: 1 },
          lastError: null,
        },
      });
      return;
    }
    // 실패: 재시도 가능하면 FAILED로 남겨 다음 run이 재시도, 불가면 그대로 FAILED(수동 확인).
    await this.prisma.digest.update({
      where: { id: digestId },
      data: {
        status: 'FAILED',
        lastAttemptAt: new Date(),
        attemptCount: { increment: 1 },
        lastError: `${r.retryable ? '[retryable] ' : '[permanent] '}${r.error}`,
      },
    });
  }
}
