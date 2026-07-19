import { describe, it, expect } from 'vitest';
import { buildPolicyEvent, type BillSnapshot } from './policy-event-builder';

const base: BillSnapshot = {
  status: 'pending',
  committeeResultCode: null,
  committeeResultDate: null,
  lawResultCode: null,
  lawResultDate: null,
  plenaryDate: null,
};

describe('buildPolicyEvent', () => {
  it('변경이 없으면 null', () => {
    expect(buildPolicyEvent(base, { ...base })).toBeNull();
  });

  it('상태 변경 시 status_change 이벤트 1건', () => {
    const draft = buildPolicyEvent(base, { ...base, status: 'committee' });
    expect(draft).not.toBeNull();
    expect(draft!.eventType).toBe('status_change');
    expect(draft!.changes).toEqual([{ field: 'status', from: 'pending', to: 'committee' }]);
  });

  it('처리단계 도달 후 pending으로 역행하면 이벤트 없음(API 일시 누락 방어)', () => {
    const draft = buildPolicyEvent(
      { ...base, status: 'committee' },
      { ...base, status: 'pending' },
    );
    expect(draft).toBeNull();
  });

  it('위원회 결과코드 신규 부여 시 committee_result 이벤트', () => {
    const draft = buildPolicyEvent(base, {
      ...base,
      committeeResultCode: '원안가결',
      committeeResultDate: '2026-07-10',
    });
    expect(draft!.eventType).toBe('committee_result');
    expect(draft!.sourceChangedAt).toBe('2026-07-10');
  });

  it('결과코드가 있음→null(누락)이면 이벤트 없음', () => {
    const draft = buildPolicyEvent(
      { ...base, committeeResultCode: '원안가결' },
      { ...base, committeeResultCode: null },
    );
    expect(draft).toBeNull();
  });

  it('본회의 처리일 신규 부여 시 plenary 이벤트(우선순위 최상)', () => {
    const draft = buildPolicyEvent(base, {
      ...base,
      status: 'passed',
      plenaryDate: '2026-07-15',
    });
    expect(draft!.eventType).toBe('plenary');
    expect(draft!.sourceChangedAt).toBe('2026-07-15');
    // 상태·본회의 변경이 함께 changes에 담긴다
    expect(draft!.changes.length).toBeGreaterThanOrEqual(2);
  });

  it('법사위 결과가 위원회보다 우선', () => {
    const draft = buildPolicyEvent(base, {
      ...base,
      committeeResultCode: 'X',
      lawResultCode: 'Y',
      lawResultDate: '2026-07-12',
    });
    expect(draft!.eventType).toBe('law_result');
    expect(draft!.sourceChangedAt).toBe('2026-07-12');
  });
});
