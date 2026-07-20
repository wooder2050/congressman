/**
 * Lawmake Radar 주간 다이제스트 이메일 렌더(순수 함수, 테스트 용이).
 *
 * DigestItem 목록 + 링크 토큰 → { subject, html }. 외부 호출·DB 없음.
 * 클릭 URL은 서버 리다이렉트 엔드포인트(`/r/c/:token`)로, 수신거부는 `/email/unsubscribe/:token`.
 * 목적 URL(법안 상세)은 토큰에 넣지 않고 서버가 opaqueId로 구성한다(open redirect 방지).
 */

/**
 * 렌더 대상 항목. 저장된 DigestItem 기준(id는 클릭 링크 토큰 opaqueId로 사용).
 * digest-builder의 DigestLineItem에 저장 후 부여된 DigestItem.id를 더한 형태.
 */
export interface RenderItem {
  id: string; // DigestItem.id (클릭 토큰 opaqueId)
  billId: string;
  billTitle: string;
  billStatus: string;
  eventType: string;
  changes: unknown;
  detectedAt: Date;
  sourceChangedAt: string | null;
}

/** 법안 status 코드 → 한글 라벨(프론트 BILL_STATUS_MAP과 일치). */
const STATUS_LABEL: Record<string, string> = {
  passed: '가결',
  pending: '계류',
  discarded: '폐기',
  committee: '위원회 심사',
};

/** eventType → 사람이 읽는 변경 유형 라벨. */
const EVENT_LABEL: Record<string, string> = {
  status_change: '처리 단계 변경',
  committee_result: '위원회 처리결과',
  law_result: '법사위 처리결과',
  plenary: '본회의 처리',
};

export function statusLabel(code: string): string {
  return STATUS_LABEL[code] ?? code;
}

export interface RenderInput {
  items: RenderItem[];
  /** 각 DigestItem.id → 클릭 링크(서명 토큰 포함 전체 URL). 렌더 전 배치가 만들어 넣는다. */
  clickUrlByItemId: Map<string, string>;
  /** 수신거부 전체 URL(서명 토큰 포함). */
  unsubscribeUrl: string;
  /** 관리 화면 URL(예: https://www.lawmake.kr/alerts). */
  managementUrl: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 한 항목의 변경 요약 문구(이전 상태 → 현재). changes 배열에서 status 변화를 우선 표기. */
export function itemChangeSummary(item: RenderItem): string {
  const label = EVENT_LABEL[item.eventType] ?? '변경';
  const changes = Array.isArray(item.changes)
    ? (item.changes as Array<{ field: string; from: string | null; to: string | null }>)
    : [];
  const statusChange = changes.find((c) => c.field === 'status');
  if (statusChange) {
    const from = statusLabel(statusChange.from ?? '');
    const to = statusLabel(statusChange.to ?? '');
    return `${label}: ${from} → ${to}`;
  }
  // 결과코드·본회의 등은 현재 상태로 요약
  return `${label} (현재: ${statusLabel(item.billStatus)})`;
}

/** 제목: "이번 주 관심 법안 변경 N건". */
export function renderSubject(items: RenderItem[]): string {
  return `[Lawmake] 이번 주 관심 법안 변경 ${items.length}건`;
}

/** 본문 HTML. 항목별 법안명·변경요약·감지시각·상세 링크 + 관리/수신거부 + 고지. */
export function renderHtml(input: RenderInput): string {
  const { items, clickUrlByItemId, unsubscribeUrl, managementUrl } = input;

  const rows = items
    .map((item) => {
      const clickUrl = clickUrlByItemId.get(item.id) ?? managementUrl;
      const changedAt = item.sourceChangedAt ?? item.detectedAt.toISOString().slice(0, 10);
      return `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #eee;">
          <a href="${escapeHtml(clickUrl)}" style="font-size:15px;font-weight:600;color:#111;text-decoration:none;">
            ${escapeHtml(item.billTitle)}
          </a>
          <div style="margin-top:4px;font-size:13px;color:#444;">${escapeHtml(itemChangeSummary(item))}</div>
          <div style="margin-top:2px;font-size:12px;color:#999;">변경 감지: ${escapeHtml(changedAt)}</div>
        </td>
      </tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="ko">
<body style="margin:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;padding:32px;">
        <tr><td>
          <div style="font-size:18px;font-weight:700;color:#111;">이번 주 관심 법안 변경 ${items.length}건</div>
          <div style="margin-top:6px;font-size:13px;color:#666;">구독하신 법안의 처리 상태가 바뀌었습니다.</div>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
        <tr><td style="padding-top:24px;">
          <a href="${escapeHtml(managementUrl)}" style="font-size:13px;color:#0F766E;text-decoration:none;">알림 관리 →</a>
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #eee;">
          <div style="font-size:11px;color:#999;line-height:1.6;">
            이 메일은 회원님이 Lawmake에서 설정한 법안 변경 알림입니다. 주 1회, 변경 사항이 있을 때만 발송됩니다.<br/>
            공공데이터(국회 의안정보시스템)를 정리한 정보이며 법률 자문이 아닙니다.<br/>
            <a href="${escapeHtml(unsubscribeUrl)}" style="color:#999;">수신 거부</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
