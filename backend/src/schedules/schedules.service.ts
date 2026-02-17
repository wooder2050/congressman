import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_HOUR = 60 * 60;

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getSchedules(termId: number, type?: string, page = 1, limit = 30) {
    const key = `schedules:list:${termId}:${type ?? 'all'}:${page}:${limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

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
    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getUpcomingSchedules(termId: number, limit = 5) {
    const key = `schedules:upcoming:${termId}:${limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const today = new Date().toISOString().slice(0, 10);

    const schedules = await this.prisma.schedule.findMany({
      where: { termId, meetingDate: { gte: today } },
      orderBy: [{ meetingDate: 'asc' }, { meetingTime: 'asc' }],
      take: limit,
    });

    await this.redis.set(key, schedules, TTL_HOUR);
    return schedules;
  }
}
