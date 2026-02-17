import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_HOUR = 60 * 60;

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

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

    await this.redis.set(key, result, TTL_HOUR);
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
      // 최다 대표발의 의원 TOP 5
      this.prisma.$queryRaw<
        { memberId: string; name: string; photoUrl: string; billCount: bigint }[]
      >`
        SELECT bp."memberId", m.name, m."photoUrl", COUNT(*)::bigint as "billCount"
        FROM "BillProposer" bp
        JOIN "Bill" b ON bp."billId" = b.id
        JOIN "Member" m ON bp."memberId" = m.id
        WHERE b."termId" = ${termId} AND bp."role" = 'representative'
        GROUP BY bp."memberId", m.name, m."photoUrl"
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

    // 최다 발의 의원의 파티 정보 조회
    const proposerIds = topProposersRaw.map((p) => p.memberId);
    const memberTerms =
      proposerIds.length > 0
        ? await this.prisma.memberTerm.findMany({
            where: { memberId: { in: proposerIds }, termId },
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
        party: partyMap.get(p.memberId) ?? {
          id: 'independent',
          name: '무소속',
          shortName: '무소속',
          color: '#999999',
        },
      })),
      rejectedVotes: rejectedVotesRaw.map(mapVote),
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }
}
