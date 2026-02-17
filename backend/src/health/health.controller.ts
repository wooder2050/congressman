import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
      where: { status: 'completed' },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });
    return { lastSyncAt: log?.completedAt ?? null };
  }

  @Get()
  @ApiOperation({ summary: '헬스체크', description: 'DB, Redis 연결 상태 확인' })
  async check() {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    try {
      const redisPing = await this.redis.ping();
      redisStatus = redisPing === 'PONG' ? 'ok' : 'error';
    } catch {
      redisStatus = 'error';
    }

    const status = dbStatus === 'ok' ? 'ok' : 'error';
    return { status, db: dbStatus, redis: redisStatus };
  }
}
