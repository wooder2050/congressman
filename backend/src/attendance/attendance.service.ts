import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface AbsenceDetail {
  type: '무단결석' | '청가' | '출장' | '질병';
  count: number;
}

const TTL_HOUR = 60 * 60; // 1h

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findOne(memberId: string, termId: number) {
    const key = `attendance:${memberId}:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const record = await this.prisma.attendance.findUnique({
      where: { memberId_termId: { memberId, termId } },
    });

    if (!record) return null;

    const result = {
      memberId: record.memberId,
      termId: record.termId,
      totalSessions: record.totalSessions,
      attended: record.attended,
      absent: record.absent,
      leave: record.leave,
      travel: record.travel,
      rate: record.rate,
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getAbsenceDetails(memberId: string, termId: number): Promise<AbsenceDetail[]> {
    const key = `attendance:absence:${memberId}:${termId}`;
    const cached = await this.redis.get<AbsenceDetail[]>(key);
    if (cached) return cached;

    const record = await this.prisma.attendance.findUnique({
      where: { memberId_termId: { memberId, termId } },
    });

    if (!record) return [];

    const details: AbsenceDetail[] = [];
    if (record.absent > 0) details.push({ type: '무단결석', count: record.absent });
    if (record.leave > 0) details.push({ type: '청가', count: record.leave });
    if (record.travel > 0) details.push({ type: '출장', count: record.travel });

    await this.redis.set(key, details, TTL_HOUR);
    return details;
  }
}
