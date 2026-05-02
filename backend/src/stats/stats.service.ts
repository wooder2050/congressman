import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_6H = 60 * 60 * 6;

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPropertyStats() {
    const key = `stats:property:22`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const TERM_ID = 22;
    const ASSET_YEAR = 2024;

    const [members, assets] = await Promise.all([
      this.prisma.$queryRaw<
        {
          memberId: string;
          name: string;
          photoUrl: string;
          party: string;
          partyColor: string;
          district: string;
          proportional: boolean;
          committees: string[];
          electedCount: number;
        }[]
      >`
        SELECT
          m.id AS "memberId",
          m.name,
          m."photoUrl",
          p."shortName" AS party,
          p.color AS "partyColor",
          mt.district,
          mt.proportional,
          mt.committees,
          mt."electedCount"
        FROM "MemberTerm" mt
        JOIN "Member" m ON mt."memberId" = m.id
        JOIN "Party" p ON mt."partyId" = p.id
        WHERE mt."termId" = ${TERM_ID}
        ORDER BY m.name
      `,
      this.prisma.$queryRaw<
        {
          memberId: string;
          category: string;
          item: string;
          amount: bigint;
          relation: string;
        }[]
      >`
        SELECT
          a."memberId",
          a.category,
          a.item,
          a.amount,
          a.relation
        FROM "Asset" a
        JOIN "MemberTerm" mt ON a."memberId" = mt."memberId" AND mt."termId" = ${TERM_ID}
        WHERE a.year = ${ASSET_YEAR}
          AND a.category IN ('건물', '토지')
          AND a.relation IN ('본인', '배우자')
          AND a.item NOT LIKE '%전세(임차)권%'
      `,
    ]);

    const result = {
      members,
      assets: assets.map((a) => ({
        memberId: a.memberId,
        category: a.category,
        item: a.item,
        amount: Number(a.amount),
        relation: a.relation,
      })),
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  async getAttendanceRanking(termId: number, limit = 5) {
    const key = `stats:attendance-ranking:${termId}:${limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [topRaw, bottomRaw] = await Promise.all([
      this.prisma.$queryRaw<
        {
          memberId: string;
          name: string;
          photoUrl: string;
          rate: number;
          attended: number;
          totalSessions: number;
        }[]
      >`
        SELECT a."memberId", m.name, m."photoUrl",
               a.rate, a.attended, a."totalSessions"
        FROM "Attendance" a
        JOIN "Member" m ON a."memberId" = m.id
        WHERE a."termId" = ${termId} AND a."totalSessions" > 0
        ORDER BY a.rate DESC, a.attended DESC
        LIMIT ${limit}
      `,
      this.prisma.$queryRaw<
        {
          memberId: string;
          name: string;
          photoUrl: string;
          rate: number;
          attended: number;
          totalSessions: number;
        }[]
      >`
        SELECT a."memberId", m.name, m."photoUrl",
               a.rate, a.attended, a."totalSessions"
        FROM "Attendance" a
        JOIN "Member" m ON a."memberId" = m.id
        WHERE a."termId" = ${termId} AND a."totalSessions" > 0
        ORDER BY a.rate ASC, a.absent DESC
        LIMIT ${limit}
      `,
    ]);

    const allIds = [...topRaw, ...bottomRaw].map((r) => r.memberId);
    const memberTerms =
      allIds.length > 0
        ? await this.prisma.memberTerm.findMany({
            where: { memberId: { in: allIds }, termId },
            include: { party: true },
          })
        : [];
    const partyMap = new Map(
      memberTerms.map((mt) => [
        mt.memberId,
        {
          id: mt.party.id,
          name: mt.party.name,
          shortName: mt.party.shortName,
          color: mt.party.color,
        },
      ]),
    );

    const defaultParty = {
      id: 'independent',
      name: '무소속',
      shortName: '무소속',
      color: '#999999',
    };

    const mapItem = (r: (typeof topRaw)[0]) => ({
      memberId: r.memberId,
      name: r.name,
      photoUrl: r.photoUrl,
      rate: r.rate,
      attended: r.attended,
      totalSessions: r.totalSessions,
      party: partyMap.get(r.memberId) ?? defaultParty,
    });

    const result = {
      top: topRaw.map(mapItem),
      bottom: bottomRaw.map(mapItem),
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  async getHomeStats(termId: number) {
    const key = `stats:home:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [
      memberCount,
      billCount,
      voteCount,
      avgAttendance,
      recentVotesRaw,
      recentBillsRaw,
      closeVotesRaw,
      topProposersRaw,
      rejectedVotesRaw,
    ] = await Promise.all([
      this.prisma.memberTerm.count({ where: { termId } }),
      this.prisma.bill.count({ where: { termId } }),
      this.prisma.vote.count({ where: { termId } }),
      this.prisma.attendance.aggregate({
        where: { termId },
        _avg: { rate: true },
      }),
      this.prisma.vote.findMany({
        where: { termId },
        orderBy: { procDate: 'desc' },
        take: 3,
      }),
      this.prisma.bill.findMany({
        where: { termId },
        orderBy: { proposedDate: 'desc' },
        take: 3,
        include: { proposers: true },
      }),
      // 찬반 팽팽한 표결
      this.prisma.$queryRaw<
        {
          id: string;
          billNo: string;
          billName: string;
          committee: string | null;
          procDate: string;
          procResult: string;
          resultCode: string;
          memberTotal: number;
          voteTotal: number;
          yesCount: number;
          noCount: number;
          abstainCount: number;
          linkUrl: string;
          termId: number;
        }[]
      >`
        SELECT id, "billNo", "billName", committee, "procDate", "procResult",
               "resultCode", "memberTotal", "voteTotal", "yesCount", "noCount",
               "abstainCount", "linkUrl", "termId"
        FROM "Vote"
        WHERE "termId" = ${termId} AND "voteTotal" > 0 AND "noCount" > 0
        ORDER BY ABS("yesCount" - "noCount")::float / "voteTotal" ASC,
                 "procDate" DESC
        LIMIT 3
      `,
      // 최다 대표발의 의원 TOP 5 (파티 정보 포함)
      this.prisma.$queryRaw<
        {
          memberId: string;
          name: string;
          photoUrl: string;
          billCount: bigint;
          partyId: string;
          partyName: string;
          partyShortName: string;
          partyColor: string;
        }[]
      >`
        SELECT bp."memberId", m.name, m."photoUrl", COUNT(*)::bigint as "billCount",
               p.id as "partyId", p.name as "partyName", p."shortName" as "partyShortName", p.color as "partyColor"
        FROM "BillProposer" bp
        JOIN "Bill" b ON bp."billId" = b.id
        JOIN "Member" m ON bp."memberId" = m.id
        LEFT JOIN "MemberTerm" mt ON mt."memberId" = bp."memberId" AND mt."termId" = ${termId}
        LEFT JOIN "Party" p ON p.id = mt."partyId"
        WHERE b."termId" = ${termId} AND bp."role" = 'representative'
        GROUP BY bp."memberId", m.name, m."photoUrl", p.id, p.name, p."shortName", p.color
        ORDER BY "billCount" DESC
        LIMIT 5
      `,
      // 최근 부결 표결
      this.prisma.vote.findMany({
        where: { termId, resultCode: 'rejected' },
        orderBy: { procDate: 'desc' },
        take: 3,
      }),
    ]);

    const mapVote = (v: (typeof recentVotesRaw)[0]) => ({
      id: v.id,
      billNo: v.billNo,
      billName: v.billName,
      committee: v.committee,
      procDate: v.procDate,
      procResult: v.procResult,
      resultCode: v.resultCode,
      memberTotal: v.memberTotal,
      voteTotal: v.voteTotal,
      yesCount: v.yesCount,
      noCount: v.noCount,
      abstainCount: v.abstainCount,
      linkUrl: v.linkUrl,
      termId: v.termId,
    });

    const result = {
      memberCount,
      billCount,
      voteCount,
      avgAttendanceRate: Math.round((avgAttendance._avg.rate ?? 0) * 10) / 10,
      recentVotes: recentVotesRaw.map(mapVote),
      recentBills: recentBillsRaw.map((b) => ({
        id: b.id,
        title: b.title,
        proposerIds: b.proposers.map((p) => p.memberId),
        proposerName: b.proposerName,
        coProposerCount: b.coProposerCount,
        status: b.status,
        proposedDate: b.proposedDate,
        termId: b.termId,
        committee: b.committee,
        simpleSummary: b.simpleSummary ?? null,
        topic: b.topic ?? null,
      })),
      closeVotes: closeVotesRaw.map((v) => ({
        id: v.id,
        billNo: v.billNo,
        billName: v.billName,
        committee: v.committee,
        procDate: v.procDate,
        procResult: v.procResult,
        resultCode: v.resultCode,
        memberTotal: v.memberTotal,
        voteTotal: v.voteTotal,
        yesCount: v.yesCount,
        noCount: v.noCount,
        abstainCount: v.abstainCount,
        linkUrl: v.linkUrl,
        termId: v.termId,
      })),
      topProposers: topProposersRaw.map((p) => ({
        memberId: p.memberId,
        name: p.name,
        photoUrl: p.photoUrl,
        billCount: Number(p.billCount),
        party: p.partyId
          ? {
              id: p.partyId,
              name: p.partyName,
              shortName: p.partyShortName,
              color: p.partyColor,
            }
          : {
              id: 'independent',
              name: '무소속',
              shortName: '무소속',
              color: '#999999',
            },
      })),
      rejectedVotes: rejectedVotesRaw.map(mapVote),
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  /** 관심 토픽 기반 최근 법안 (이슈 레이더) */
  async getRadar(termId: number, topics: string[]) {
    if (!topics.length) return { bills: [], topics: [] };

    const key = `stats:radar:${termId}:${topics.sort().join(',')}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const bills = await this.prisma.bill.findMany({
      where: {
        termId,
        topic: { in: topics },
      },
      orderBy: { proposedDate: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        proposerName: true,
        status: true,
        proposedDate: true,
        committee: true,
        simpleSummary: true,
        topic: true,
      },
    });

    const result = { bills, topics };
    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  /** 오늘 브리핑 */
  async getTodayBriefing(termId: number) {
    const today = new Date().toISOString().slice(0, 10);
    const key = `stats:today:${termId}:${today}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    // 최근 3일 기준 날짜
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const since = threeDaysAgo.toISOString().slice(0, 10);

    const [schedules, recentVotes, recentBills] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { termId, meetingDate: { gte: today } },
        orderBy: [{ meetingDate: 'asc' }, { meetingTime: 'asc' }],
        take: 10,
      }),
      this.prisma.vote.findMany({
        where: { termId, procDate: { gte: since } },
        orderBy: { procDate: 'desc' },
        take: 5,
      }),
      this.prisma.bill.findMany({
        where: { termId, proposedDate: { gte: since } },
        orderBy: { proposedDate: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          proposerName: true,
          status: true,
          proposedDate: true,
          committee: true,
          simpleSummary: true,
          topic: true,
        },
      }),
    ]);

    const result = { date: today, schedules, recentVotes, recentBills };
    // 30분 캐시 (자주 갱신)
    await this.redis.set(key, result, 60 * 30);
    return result;
  }
}
