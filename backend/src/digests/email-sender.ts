/**
 * Lawmake Radar 이메일 발송 어댑터.
 *
 * 공급자를 추상화해 발송기 로직이 Resend에 직접 묶이지 않게 한다.
 * - NoopEmailSender: 실제 발송 없이 성공 반환(DRY_RUN·테스트·계정 미설정 시).
 * - ResendEmailSender: Resend API 호출. idempotencyKey로 중복 발송 방지.
 *
 * 실연동(계정·도메인 인증)은 별도 승인 후. RESEND_API_KEY 없으면 팩토리가 Noop을 준다.
 */

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  /** 중복 발송 방지 키(=Digest.idempotencyKey). Resend Idempotency-Key 헤더로 전달. */
  idempotencyKey: string;
  /** 수신거부 URL(List-Unsubscribe 헤더용). */
  unsubscribeUrl: string;
}

export type SendResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; retryable: boolean; error: string };

export interface EmailSender {
  readonly mode: string;
  send(input: SendEmailInput): Promise<SendResult>;
}

/** 실제 발송 없이 성공 반환. DRY_RUN·테스트·미설정 시. */
export class NoopEmailSender implements EmailSender {
  readonly mode = 'noop';
  async send(_input: SendEmailInput): Promise<SendResult> {
    void _input;
    return { ok: true, providerMessageId: null };
  }
}

/** Resend API로 발송. https://resend.com/docs */
export class ResendEmailSender implements EmailSender {
  readonly mode = 'resend';
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(input: SendEmailInput): Promise<SendResult> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          // 같은 payload로 재시도해도 중복 발송 안 되게(24h 보존).
          'Idempotency-Key': `radar-digest/${input.idempotencyKey}`,
        },
        body: JSON.stringify({
          from: this.from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          headers: {
            'List-Unsubscribe': `<${input.unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });

      if (res.ok) {
        const body = (await res.json().catch(() => ({}))) as { id?: string };
        return { ok: true, providerMessageId: body.id ?? null };
      }

      // 429·5xx·네트워크는 재시도 가능, 4xx(주소·인증 오류)는 불가.
      const retryable = res.status === 429 || res.status >= 500;
      const text = await res.text().catch(() => '');
      return { ok: false, retryable, error: `resend ${res.status}: ${text.slice(0, 300)}` };
    } catch (e) {
      // 네트워크/timeout은 결과 불명확 → 재시도 가능으로 취급.
      return { ok: false, retryable: true, error: e instanceof Error ? e.message : String(e) };
    }
  }
}

/**
 * 환경변수로 발송기를 만든다.
 * - RADAR_EMAIL_MODE=LIVE 또는 ALLOWLIST이고 RESEND_API_KEY 있으면 ResendEmailSender.
 * - 그 외(DRY_RUN·키없음)는 NoopEmailSender.
 * 실제 발송 여부(allowlist 필터 등)는 발송기 배치가 결정하고, 어댑터는 순수 전송만.
 */
export function createEmailSenderFromEnv(): EmailSender {
  const mode = process.env.RADAR_EMAIL_MODE ?? 'DRY_RUN';
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RADAR_EMAIL_FROM ?? 'Lawmake 알림 <alerts@lawmake.kr>';
  if ((mode === 'LIVE' || mode === 'ALLOWLIST') && apiKey) {
    return new ResendEmailSender(apiKey, from);
  }
  return new NoopEmailSender();
}
