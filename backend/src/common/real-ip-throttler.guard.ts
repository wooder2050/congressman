import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Railway는 실제 클라이언트 IP를 `X-Real-IP` 헤더로만 보장한다.
 * (X-Forwarded-For는 클라이언트가 위조 가능해 rate limit 우회에 악용될 수 있음)
 *
 * 따라서 throttler tracker를 X-Real-IP 우선으로 지정한다.
 * 헤더가 없으면(로컬/직접 연결) req.ip로 폴백한다.
 */
@Injectable()
export class RealIpThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const headers = (req.headers ?? {}) as Record<string, string | string[] | undefined>;
    const realIp = headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.length > 0) {
      return realIp;
    }
    if (Array.isArray(realIp) && realIp.length > 0) {
      return realIp[0];
    }
    // 폴백: Express req.ip (로컬/직접 연결 환경)
    return (req.ip as string) ?? 'unknown';
  }
}
