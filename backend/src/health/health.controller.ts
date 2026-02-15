import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
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
      redisStatus = redisPing === 'PONG' ? 'ok' : `unexpected: ${redisPing}`;
    } catch (e) {
      redisStatus = `error: ${e instanceof Error ? e.message : String(e)}`;
    }

    const status = dbStatus === 'ok' ? 'ok' : 'error';
    return { status, db: dbStatus, redis: redisStatus };
  }
}
