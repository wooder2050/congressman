import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('last-sync')
  @ApiOperation({
    summary: '마지막 동기화 시각',
    description: '가장 최근 성공한 동기화 시각을 반환합니다',
  })
  async lastSync() {
    const log = await this.prisma.syncLog.findFirst({
      where: {
        status: 'completed',
        // Radar 다이제스트 배치 로그는 '데이터 동기화'가 아니므로 마지막 갱신 시각에서 제외.
        NOT: { syncType: { startsWith: 'radar-' } },
      },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });
    return { lastSyncAt: log?.completedAt ?? null };
  }

  @Get()
  // Railway readiness healthcheck가 자주 호출하므로 이 엔드포인트만 rate limit에서 제외.
  // last-sync·deep은 기본 제한 유지(deep은 매 요청 DB·Redis 호출).
  @SkipThrottle()
  @ApiOperation({ summary: '헬스체크', description: 'DB 연결 상태 확인 (readiness)' })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      // DB 연결 실패 시 503을 반환해 Railway healthcheck가 비정상을 감지하도록 함
      throw new ServiceUnavailableException({ status: 'error', db: 'error' });
    }
    return { status: 'ok', db: 'ok' };
  }

  @Get('deep')
  @ApiOperation({
    summary: '심층 헬스체크',
    description: 'DB + Redis 연결 상태 확인 (수동 점검용)',
  })
  async deepCheck() {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    try {
      const redisPing = await this.redis.ping();
      redisStatus =
        redisPing === 'PONG' || redisPing === 'DISABLED' ? redisPing.toLowerCase() : 'error';
    } catch {
      redisStatus = 'error';
    }

    const status = dbStatus === 'ok' ? 'ok' : 'error';
    return { status, db: dbStatus, redis: redisStatus };
  }
}
