import { describe, it, expect } from 'vitest';
import { buildPolicyEvent, effectiveNext, type BillSnapshot } from './policy-event-builder';

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

  it('위원회 결과코드 신규 부여 시 committee_result 이벤트', () => {
    const draft = buildPolicyEvent(base, {
      ...base,
      committeeResultCode: '원안가결',
      committeeResultDate: '2026-07-10',
    });
    expect(draft!.eventType).toBe('committee_result');
    expect(draft!.sourceChangedAt).toBe('2026-07-10');
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

describe('effectiveNext (역행/누락 방어)', () => {
  it('정상 전진은 새 값을 채택', () => {
    const eff = effectiveNext(base, { ...base, status: 'committee' });
    expect(eff.status).toBe('committee');
  });

  it('처리단계 도달 후 pending으로 역행하면 기존 status 유지 → 이벤트 없음', () => {
    const old = { ...base, status: 'committee' };
    const eff = effectiveNext(old, { ...base, status: 'pending' });
    expect(eff.status).toBe('committee');
    expect(buildPolicyEvent(old, eff)).toBeNull();
  });

  it('결과코드가 있음→null(누락)이면 기존 값 유지 → 이벤트 없음', () => {
    const old = {
      ...base,
      status: 'committee',
      committeeResultCode: '원안가결',
      committeeResultDate: '2026-07-01',
    };
    const eff = effectiveNext(old, { ...old, committeeResultCode: null, committeeResultDate: null });
    expect(eff.committeeResultCode).toBe('원안가결');
    expect(eff.committeeResultDate).toBe('2026-07-01');
    expect(buildPolicyEvent(old, eff)).toBeNull();
  });

  it('본회의 처리일 누락(있음→null)이면 기존 값 유지', () => {
    const old = { ...base, status: 'passed', plenaryDate: '2026-07-15' };
    const eff = effectiveNext(old, { ...old, plenaryDate: null });
    expect(eff.plenaryDate).toBe('2026-07-15');
  });

  it('discarded(폐기)는 pending보다 진행 단계라 역행 아님', () => {
    const eff = effectiveNext({ ...base, status: 'committee' }, { ...base, status: 'discarded' });
    expect(eff.status).toBe('discarded');
  });
});
