import { describe, it, expect, beforeEach } from 'vitest';
import { RealIpThrottlerGuard } from './real-ip-throttler.guard';

// getTracker는 protected이므로 테스트용으로 노출
class TestGuard extends RealIpThrottlerGuard {
  public track(req: Record<string, unknown>) {
    return this.getTracker(req);
  }
}

describe('RealIpThrottlerGuard.getTracker', () => {
  let guard: TestGuard;

  beforeEach(() => {
    // ThrottlerGuard 생성자 의존성은 getTracker 테스트에 불필요하므로 최소 목으로 생성
    guard = Object.setPrototypeOf({}, TestGuard.prototype) as TestGuard;
  });

  it('X-Real-IP 헤더가 있으면 그 값을 tracker로 쓴다', async () => {
    const tracker = await guard.track({ headers: { 'x-real-ip': '203.0.113.5' }, ip: '10.0.0.1' });
    expect(tracker).toBe('203.0.113.5');
  });

  it('X-Real-IP가 배열이면 첫 값을 쓴다', async () => {
    const tracker = await guard.track({
      headers: { 'x-real-ip': ['203.0.113.9', '10.0.0.2'] },
      ip: '10.0.0.1',
    });
    expect(tracker).toBe('203.0.113.9');
  });

  it('X-Real-IP가 없으면 req.ip로 폴백한다', async () => {
    const tracker = await guard.track({ headers: {}, ip: '198.51.100.7' });
    expect(tracker).toBe('198.51.100.7');
  });

  it('X-Real-IP도 req.ip도 없으면 unknown', async () => {
    const tracker = await guard.track({ headers: {} });
    expect(tracker).toBe('unknown');
  });

  it('빈 문자열 X-Real-IP는 무시하고 폴백한다', async () => {
    const tracker = await guard.track({ headers: { 'x-real-ip': '' }, ip: '198.51.100.8' });
    expect(tracker).toBe('198.51.100.8');
  });
});
