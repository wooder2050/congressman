import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_DAY = 60 * 60 * 24; // 24h
const TTL_HOUR = 60 * 60; // 1h

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findByTerm(termId: number) {
    const key = `members:term:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { termId },
      include: { member: true, party: true },
    });

    const result = memberTerms.map((mt) => ({
      id: mt.member.id,
      name: mt.member.name,
      photoUrl: mt.member.photoUrl,
      birthDate: mt.member.birthDate,
      electedCount: mt.member.electedCount,
      term: {
        memberId: mt.memberId,
        termId: mt.termId,
        party: {
          id: mt.party.id,
          name: mt.party.name,
          shortName: mt.party.shortName,
          color: mt.party.color,
        },
        district: mt.district,
        proportional: mt.proportional,
        committees: mt.committees,
      },
    }));

    await this.redis.set(key, result, TTL_DAY);
    return result;
  }

  async findById(id: string) {
    const key = `member:${id}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) return null;

    const result = {
      id: member.id,
      name: member.name,
      photoUrl: member.photoUrl,
      birthDate: member.birthDate,
      electedCount: member.electedCount,
    };

    await this.redis.set(key, result, TTL_DAY);
    return result;
  }

  async findTermsByMemberId(memberId: string) {
    const key = `member:terms:${memberId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { memberId },
      include: { party: true },
      orderBy: { termId: 'desc' },
    });

    const result = memberTerms.map((mt) => ({
      memberId: mt.memberId,
      termId: mt.termId,
      party: {
        id: mt.party.id,
        name: mt.party.name,
        shortName: mt.party.shortName,
        color: mt.party.color,
      },
      district: mt.district,
      proportional: mt.proportional,
      committees: mt.committees,
    }));

    await this.redis.set(key, result, TTL_DAY);
    return result;
  }

  async getHistory(memberId: string) {
    const key = `member:history:${memberId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { memberId },
      include: { term: true },
      orderBy: { termId: 'desc' },
    });

    const result = await Promise.all(
      memberTerms.map(async (mt) => {
        const attendance = await this.prisma.attendance.findUnique({
          where: { memberId_termId: { memberId, termId: mt.termId } },
        });

        const billsProposed = await this.prisma.billProposer.count({
          where: {
            memberId,
            bill: { termId: mt.termId },
          },
        });

        const billsPassed = await this.prisma.billProposer.count({
          where: {
            memberId,
            bill: { termId: mt.termId, status: 'passed' },
          },
        });

        return {
          termId: mt.termId,
          termName: mt.term.name,
          attendanceRate: attendance?.rate ?? 0,
          billsProposed,
          billsPassed,
        };
      }),
    );

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async findMemberVotes(
    memberId: string,
    params: { termId: number; page: number; limit: number; result?: string },
  ) {
    const key = `member:votes:${memberId}:${params.termId}:${params.result ?? ''}:${params.page}:${params.limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const where = {
      memberId,
      vote: { termId: params.termId },
      ...(params.result ? { result: params.result } : {}),
    };

    const [memberVotes, total, summary] = await Promise.all([
      this.prisma.memberVote.findMany({
        where,
        include: { vote: true },
        orderBy: { vote: { procDate: 'desc' } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.memberVote.count({ where }),
      this.prisma.memberVote.groupBy({
        by: ['result'],
        where: { memberId, vote: { termId: params.termId } },
        _count: true,
      }),
    ]);

    const summaryMap: Record<string, number> = { yes: 0, no: 0, abstain: 0, absent: 0 };
    for (const s of summary) {
      summaryMap[s.result] = s._count;
    }

    const result = {
      votes: memberVotes.map((mv) => ({
        voteId: mv.voteId,
        billName: mv.vote.billName,
        billNo: mv.vote.billNo,
        procDate: mv.vote.procDate,
        procResult: mv.vote.procResult,
        resultCode: mv.vote.resultCode,
        memberResult: mv.result,
        committee: mv.vote.committee,
      })),
      summary: {
        yes: summaryMap.yes,
        no: summaryMap.no,
        abstain: summaryMap.abstain,
        absent: summaryMap.absent,
        total: summaryMap.yes + summaryMap.no + summaryMap.abstain + summaryMap.absent,
      },
      total,
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }
}
