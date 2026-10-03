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

  async getUpcomingSchedules(termId: number, limit = 5, keyword?: string) {
    // 회의 일자는 한국 날짜라 오늘도 KST로 계산한다(UTC로 하면 오전 9시 전엔 전날이 된다)
    const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const key = `schedules:upcoming:${termId}:${limit}:${keyword ?? ''}:${today}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const schedules = await this.prisma.schedule.findMany({
      where: {
        termId,
        meetingDate: { gte: today },
        // 국정감사 회의만 받으려는 경우 — 제목이나 안건에 키워드가 있는 회의
        ...(keyword
          ? { OR: [{ title: { contains: keyword } }, { agenda: { contains: keyword } }] }
          : {}),
      },
      orderBy: [{ meetingDate: 'asc' }, { meetingTime: 'asc' }],
      take: limit,
    });

    await this.redis.set(key, schedules, TTL_HOUR);
    return schedules;
  }
}
