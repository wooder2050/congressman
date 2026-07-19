import { describe, it, expect } from 'vitest';
import {
  matchEventsToUsers,
  resolvePeriod,
  periodKeyOf,
  type EventInput,
  type WatchInput,
} from './digest-builder';

function ev(
  partial: Partial<EventInput> & { id: string; billId: string; detectedAt: Date },
): EventInput {
  return {
    eventType: 'status_change',
    changes: [{ field: 'status', from: 'pending', to: 'committee' }],
    sourceChangedAt: null,
    billTitle: '테스트 법안',
    billStatus: 'committee',
    ...partial,
  };
}

const D = (iso: string) => new Date(iso);

describe('resolvePeriod', () => {
  it('마지막 READY가 있으면 그 periodEnd부터 cutoff까지', () => {
    const { periodStart, periodEnd } = resolvePeriod(
      D('2026-07-20T00:00:00Z'),
      D('2026-07-13T00:00:00Z'),
    );
    expect(periodStart.toISOString()).toBe('2026-07-13T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-07-20T00:00:00.000Z');
  });

  it('최초 실행(READY 없음)이면 cutoff - 7일', () => {
    const { periodStart, periodEnd } = resolvePeriod(D('2026-07-20T00:00:00Z'), null);
    expect(periodStart.toISOString()).toBe('2026-07-13T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-07-20T00:00:00.000Z');
  });

  it('배치 한 주 누락 시 다음 실행이 14일 구간을 커버', () => {
    // 지난주 배치가 안 돌아서 lastReady가 2주 전
    const { periodStart, periodEnd } = resolvePeriod(
      D('2026-07-20T00:00:00Z'),
      D('2026-07-06T00:00:00Z'),
    );
    const days = (periodEnd.getTime() - periodStart.getTime()) / 86400000;
    expect(days).toBe(14);
  });
});

describe('periodKeyOf', () => {
  it('ISO week 키를 만든다', () => {
    // 2026-07-20은 월요일, ISO week 30
    expect(periodKeyOf(D('2026-07-20T00:00:00Z'))).toBe('2026-W30');
  });
  it('같은 주는 같은 키', () => {
    expect(periodKeyOf(D('2026-07-20T00:00:00Z'))).toBe(periodKeyOf(D('2026-07-20T12:00:00Z')));
  });
});

describe('matchEventsToUsers', () => {
  const periodStart = D('2026-07-13T00:00:00Z');
  const periodEnd = D('2026-07-20T00:00:00Z');

  const watches: WatchInput[] = [
    { id: 'w1', userId: 'userA', billId: 'bill1', createdAt: D('2026-07-01T00:00:00Z') },
    { id: 'w2', userId: 'userB', billId: 'bill1', createdAt: D('2026-07-15T00:00:00Z') },
    { id: 'w3', userId: 'userA', billId: 'bill2', createdAt: D('2026-07-01T00:00:00Z') },
  ];

  it('활성 Watch가 있는 사용자에게 기간 내 이벤트를 묶는다', () => {
    const events = [ev({ id: 'e1', billId: 'bill1', detectedAt: D('2026-07-16T00:00:00Z') })];
    const result = matchEventsToUsers(watches, events, periodStart, periodEnd);
    // userA(w1), userB(w2) 둘 다 bill1 구독 → 둘 다 받음
    expect(result.map((r) => r.userId).sort()).toEqual(['userA', 'userB']);
    expect(result.find((r) => r.userId === 'userA')!.items).toHaveLength(1);
  });

  it('Watch 생성 이전 이벤트는 제외', () => {
    // e는 07-14 발생, userB의 w2는 07-15 생성 → userB 제외, userA(07-01)만 포함
    const events = [ev({ id: 'e1', billId: 'bill1', detectedAt: D('2026-07-14T00:00:00Z') })];
    const result = matchEventsToUsers(watches, events, periodStart, periodEnd);
    expect(result.map((r) => r.userId)).toEqual(['userA']);
  });

  it('기간 밖 이벤트는 제외', () => {
    const events = [
      ev({ id: 'before', billId: 'bill1', detectedAt: D('2026-07-12T23:59:00Z') }),
      ev({ id: 'after', billId: 'bill1', detectedAt: D('2026-07-20T00:00:00Z') }), // periodEnd exclusive
    ];
    expect(matchEventsToUsers(watches, events, periodStart, periodEnd)).toHaveLength(0);
  });

  it('구독 없는 법안 이벤트는 무시', () => {
    const events = [ev({ id: 'e1', billId: 'bill999', detectedAt: D('2026-07-16T00:00:00Z') })];
    expect(matchEventsToUsers(watches, events, periodStart, periodEnd)).toHaveLength(0);
  });

  it('한 사용자가 여러 법안 구독 시 이벤트가 모두 묶임', () => {
    const events = [
      ev({ id: 'e1', billId: 'bill1', detectedAt: D('2026-07-16T00:00:00Z') }),
      ev({ id: 'e2', billId: 'bill2', detectedAt: D('2026-07-17T00:00:00Z') }),
    ];
    const result = matchEventsToUsers(watches, events, periodStart, periodEnd);
    const userA = result.find((r) => r.userId === 'userA')!;
    expect(userA.items).toHaveLength(2);
    // 정렬: detectedAt 오름차순
    expect(userA.items[0].policyEventId).toBe('e1');
    expect(userA.items[1].policyEventId).toBe('e2');
  });

  it('변경 없는 사용자는 반환되지 않음(이메일 미발송)', () => {
    expect(matchEventsToUsers(watches, [], periodStart, periodEnd)).toHaveLength(0);
  });
});
