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

  async getHomeStats(termId: number) {
    const key = `stats:home:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [memberCount, billCount, voteCount, avgAttendance, recentVotesRaw, recentBillsRaw] =
      await Promise.all([
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
      ]);

    const result = {
      memberCount,
      billCount,
      voteCount,
      avgAttendanceRate: Math.round((avgAttendance._avg.rate ?? 0) * 10) / 10,
      recentVotes: recentVotesRaw.map((v) => ({
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
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }
}
