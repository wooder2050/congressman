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
