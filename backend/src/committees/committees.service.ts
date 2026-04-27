import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_6H = 60 * 60 * 6;

/** 정부조직법 개정 등으로 변경된 위원회명 → 현행 위원회명 매핑 */
const COMMITTEE_NAME_MAP: Record<string, string> = {
  기획재정위원회: '재정경제기획위원회',
  여성가족위원회: '성평등가족위원회',
  환경노동위원회: '기후에너지환경노동위원회',
};

/** 위원회 목록에서 제외할 이름 */
const EXCLUDED_COMMITTEES = new Set(['본회의']);

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
      // 3. 위원장 정보 (committeeRoles Json에서 "위원장" 값이 있는 의원만)
      this.prisma.memberTerm.findMany({
        where: {
          termId,
          committeeRoles: { path: [], not: '{}' },
        },
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

    // 옛 위원회명 → 현행 이름으로 법안 통계를 병합
    const mergedBillStats = new Map<string, number>();
    const mergedPassedStats = new Map<string, number>();
    for (const b of billStats) {
      const name = COMMITTEE_NAME_MAP[b.committee!] ?? b.committee!;
      mergedBillStats.set(name, (mergedBillStats.get(name) ?? 0) + b._count);
    }
    for (const p of passedStats) {
      const name = COMMITTEE_NAME_MAP[p.committee!] ?? p.committee!;
      mergedPassedStats.set(name, (mergedPassedStats.get(name) ?? 0) + p._count);
    }

    // 위원회명 목록 (특위, 본회의 제외)
    const committeeNames = [
      ...new Set(
        [...mergedBillStats.keys()].filter(
          (c) => !c.includes('특별위원회') && !EXCLUDED_COMMITTEES.has(c),
        ),
      ),
    ].sort();

    const memberCountMap = new Map(memberCounts.map((m) => [m.committee, Number(m.member_count)]));

    // 위원장을 위원회명으로 매칭 (committeeRoles에서 "위원장"인 위원회만)
    const chairMap = new Map<string, (typeof chairs)[0]>();
    for (const chair of chairs) {
      const roles = (chair.committeeRoles ?? {}) as Record<string, string>;
      for (const [cName, cRole] of Object.entries(roles)) {
        if (cRole === '위원장') {
          chairMap.set(cName, chair);
        }
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
      const total = mergedBillStats.get(name) ?? 0;
      const passed = mergedPassedStats.get(name) ?? 0;
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

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  async getCommitteeDetail(committeeName: string, termId: number) {
    const key = `committees:detail:${termId}:${committeeName}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const today = new Date().toISOString().slice(0, 10);

    const [billStats, members, upcomingSchedules] = await Promise.all([
      // 법안 통계
      Promise.all([
        this.prisma.bill.count({ where: { termId, committee: committeeName } }),
        this.prisma.bill.count({ where: { termId, committee: committeeName, status: 'passed' } }),
      ]),
      // 소속 위원 목록
      this.prisma.memberTerm.findMany({
        where: {
          termId,
          committees: { has: committeeName },
        },
        include: { member: true, party: true },
      }),
      // 다가오는 일정
      this.prisma.schedule.findMany({
        where: { termId, type: 'committee', committeeName, meetingDate: { gte: today } },
        orderBy: [{ meetingDate: 'asc' }, { meetingTime: 'asc' }],
        take: 3,
      }),
    ]);

    const [billTotal, billPassed] = billStats;
    const roleOrder: Record<string, number> = { 위원장: 0, 간사: 1, 위원: 2 };

    const result = {
      name: committeeName,
      billTotal,
      billPassed,
      passRate: billTotal > 0 ? Math.round((billPassed / billTotal) * 1000) / 10 : 0,
      members: members
        .map((mt) => {
          const roles = (mt.committeeRoles ?? {}) as Record<string, string>;
          const role = roles[committeeName] ?? '위원';
          return { mt, role };
        })
        .sort((a, b) => (roleOrder[a.role] ?? 2) - (roleOrder[b.role] ?? 2))
        .map(({ mt, role }) => ({
          memberId: mt.memberId,
          name: mt.member.name,
          photoUrl: mt.member.photoUrl,
          partyName: mt.party.name,
          partyColor: mt.party.color,
          role,
        })),
      upcomingSchedules: upcomingSchedules.map((s) => ({
        meetingDate: s.meetingDate,
        meetingTime: s.meetingTime,
        title: s.title,
      })),
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  async getCommitteeMinutes(committeeName: string, termId: number, page: number) {
    const key = `committees:minutes:${termId}:${committeeName}:${page}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const pageSize = 5;
    const [items, total] = await Promise.all([
      this.prisma.meetingMinutes.findMany({
        where: { termId, committeeName },
        orderBy: { confDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.meetingMinutes.count({
        where: { termId, committeeName },
      }),
    ]);

    const result = {
      items: items.map((m) => ({
        id: m.id,
        conferNum: m.conferNum,
        title: m.title,
        className: m.className,
        confDate: m.confDate,
        agendaCount: Array.isArray(m.agendas) ? (m.agendas as unknown[]).length : 0,
        agendas: m.agendas,
      })),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }
}
