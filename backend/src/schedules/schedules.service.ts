import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { isCacheablePage } from '../common/query-parsers';

const TTL_HOUR = 60 * 60;

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getSchedules(termId: number, type?: string, page = 1, limit = 30) {
    // 깊은 페이지는 캐시 skip(봇/크롤러의 ?page=N 키 폭발 방지)
    const key = isCacheablePage(page)
      ? `schedules:list:${termId}:${type ?? 'all'}:${page}:${limit}`
      : null;
    if (key) {
      const cached = await this.redis.get(key);
      if (cached) return cached;
    }

    const where: { termId: number; type?: string } = { termId };
    if (type) where.type = type;

    const [schedules, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        orderBy: [{ meetingDate: 'desc' }, { meetingTime: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.schedule.count({ where }),
    ]);

    const result = { schedules, total };
    if (key) await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getUpcomingSchedules(termId: number, limit = 5) {
    const today = new Date().toISOString().slice(0, 10);
    const key = `schedules:upcoming:${termId}:${limit}:${today}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const schedules = await this.prisma.schedule.findMany({
      where: { termId, meetingDate: { gte: today } },
      orderBy: [{ meetingDate: 'asc' }, { meetingTime: 'asc' }],
      take: limit,
    });

    await this.redis.set(key, schedules, TTL_HOUR);
    return schedules;
  }
}
