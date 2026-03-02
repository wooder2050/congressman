import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_HOUR = 60 * 60;

@Injectable()
export class CommitteesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getCommitteeStats(termId: number) {
    const key = `committees:stats:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const today = new Date().toISOString().slice(0, 10);

    const [billStats, passedStats, chairs, memberCounts, upcomingSchedules] = await Promise.all([
      // 1. 위원회별 접수 법안 수
      this.prisma.bill.groupBy({
        by: ['committee'],
        where: { termId, committee: { not: null } },
        _count: true,
      }),
      // 2. 위원회별 통과 법안 수
      this.prisma.bill.groupBy({
        by: ['committee'],
        where: { termId, committee: { not: null }, status: 'passed' },
        _count: true,
      }),
      // 3. 위원장 정보
      this.prisma.memberTerm.findMany({
        where: { termId, committeeRole: '위원장' },
        include: { member: true, party: true },
      }),
      // 4. 위원회별 소속 위원 수
      this.prisma.$queryRaw<{ committee: string; member_count: bigint }[]>`
        SELECT unnest(committees) AS committee, COUNT(DISTINCT "memberId")::bigint AS member_count
        FROM "MemberTerm"
        WHERE "termId" = ${termId}
        GROUP BY committee
      `,
      // 5. 위원회별 다가오는 일정
      this.prisma.schedule.findMany({
        where: { termId, type: 'committee', meetingDate: { gte: today } },
        orderBy: [{ meetingDate: 'asc' }, { meetingTime: 'asc' }],
      }),
    ]);

    // 위원회명 목록 (특위 제외)
    const committeeNames = [
      ...new Set(billStats.map((b) => b.committee!).filter((c) => !c.includes('특별위원회'))),
    ].sort();

    const passedMap = new Map(passedStats.map((p) => [p.committee, p._count]));
    const memberCountMap = new Map(memberCounts.map((m) => [m.committee, Number(m.member_count)]));

    // 위원장을 위원회명으로 매칭
    const chairMap = new Map<string, (typeof chairs)[0]>();
    for (const chair of chairs) {
      for (const committeeName of chair.committees) {
        chairMap.set(committeeName, chair);
      }
    }

    // 위원회별 다음 일정 (1건씩)
    const nextScheduleMap = new Map<string, (typeof upcomingSchedules)[0]>();
    for (const s of upcomingSchedules) {
      if (!nextScheduleMap.has(s.committeeName)) {
        nextScheduleMap.set(s.committeeName, s);
      }
    }

    const result = committeeNames.map((name) => {
      const total = billStats.find((b) => b.committee === name)?._count ?? 0;
      const passed = passedMap.get(name) ?? 0;
      const chair = chairMap.get(name);
      const nextSchedule = nextScheduleMap.get(name);

      return {
        name,
        billTotal: total,
        billPassed: passed,
        passRate: total > 0 ? Math.round((passed / total) * 1000) / 10 : 0,
        memberCount: memberCountMap.get(name) ?? 0,
        chair: chair
          ? {
              memberId: chair.memberId,
              name: chair.member.name,
              photoUrl: chair.member.photoUrl,
              partyName: chair.party.name,
              partyColor: chair.party.color,
            }
          : null,
        nextSchedule: nextSchedule
          ? {
              meetingDate: nextSchedule.meetingDate,
              meetingTime: nextSchedule.meetingTime,
              title: nextSchedule.title,
            }
          : null,
      };
    });

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }
}
