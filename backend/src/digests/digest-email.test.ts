import { describe, it, expect } from 'vitest';
import {
  renderSubject,
  renderHtml,
  itemChangeSummary,
  statusLabel,
  type RenderInput,
  type RenderItem,
} from './digest-email';

function item(partial: Partial<RenderItem> & { id: string }): RenderItem {
  return {
    billId: 'bill1',
    billTitle: '테스트 법안',
    billStatus: 'committee',
    eventType: 'status_change',
    changes: [{ field: 'status', from: 'pending', to: 'committee' }],
    detectedAt: new Date('2026-07-16T00:00:00Z'),
    sourceChangedAt: null,
    ...partial,
  };
}

describe('statusLabel', () => {
  it('코드를 한글 라벨로', () => {
    expect(statusLabel('committee')).toBe('위원회 심사');
    expect(statusLabel('passed')).toBe('가결');
  });
  it('알 수 없는 코드는 그대로', () => {
    expect(statusLabel('unknown')).toBe('unknown');
  });
});

describe('itemChangeSummary', () => {
  it('status 변화는 이전→현재로', () => {
    const s = itemChangeSummary(item({ id: 'e1' }));
    expect(s).toContain('계류');
    expect(s).toContain('위원회 심사');
    expect(s).toContain('→');
  });
  it('status 변화 없으면 현재 상태로 요약', () => {
    const s = itemChangeSummary(
      item({
        id: 'e1',
        eventType: 'committee_result',
        changes: [{ field: 'committeeResultCode', from: null, to: '원안가결' }],
      }),
    );
    expect(s).toContain('위원회 처리결과');
  });
});

describe('renderSubject', () => {
  it('건수를 제목에 포함', () => {
    expect(renderSubject([item({ id: 'e1' }), item({ id: 'e2' })])).toContain('2건');
  });
});

describe('renderHtml', () => {
  const base: RenderInput = {
    items: [item({ id: 'di1' })],
    clickUrlByItemId: new Map([['di1', 'https://api.lawmake.kr/r/c/tok1']]),
    unsubscribeUrl: 'https://api.lawmake.kr/email/unsubscribe/tok2',
    managementUrl: 'https://www.lawmake.kr/alerts',
  };

  it('클릭 URL·수신거부·관리 링크를 포함', () => {
    const html = renderHtml(base);
    expect(html).toContain('https://api.lawmake.kr/r/c/tok1');
    expect(html).toContain('https://api.lawmake.kr/email/unsubscribe/tok2');
    expect(html).toContain('https://www.lawmake.kr/alerts');
    expect(html).toContain('법률 자문이 아닙니다');
  });

  it('HTML 특수문자를 이스케이프(XSS 방지)', () => {
    const evil: RenderInput = {
      ...base,
      items: [item({ id: 'di1', billTitle: '<script>alert(1)</script>' })],
    };
    const html = renderHtml(evil);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('클릭 URL 없는 항목은 관리 URL로 폴백', () => {
    const noUrl: RenderInput = { ...base, clickUrlByItemId: new Map() };
    const html = renderHtml(noUrl);
    expect(html).toContain('https://www.lawmake.kr/alerts');
  });
});
