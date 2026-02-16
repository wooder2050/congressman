import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

interface FindAllParams {
  termId?: number;
  resultCode?: string;
  page: number;
  limit: number;
}

const TTL_HOUR = 60 * 60;

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: FindAllParams) {
    const key = `votes:${params.termId ?? ''}:${params.resultCode ?? ''}:${params.page}:${params.limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const where: Prisma.VoteWhereInput = {};
    if (params.termId) where.termId = params.termId;
    if (params.resultCode) where.resultCode = params.resultCode;

    const [votes, total] = await Promise.all([
      this.prisma.vote.findMany({
        where,
        orderBy: { procDate: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.vote.count({ where }),
    ]);

    const result = {
      votes: votes.map((v) => ({
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
      total,
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getSummary(termId: number) {
    const key = `votes:summary:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [total, passed, amended, rejected, discarded] = await Promise.all([
      this.prisma.vote.count({ where: { termId } }),
      this.prisma.vote.count({ where: { termId, resultCode: 'passed' } }),
      this.prisma.vote.count({ where: { termId, resultCode: 'amended' } }),
      this.prisma.vote.count({ where: { termId, resultCode: 'rejected' } }),
      this.prisma.vote.count({ where: { termId, resultCode: 'discarded' } }),
    ]);

    const result = { total, passed, amended, rejected, discarded };
    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async findMemberVotesByVoteId(voteId: string) {
    const key = `votes:member-votes:${voteId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const vote = await this.prisma.vote.findUnique({ where: { id: voteId } });
    if (!vote) return null;

    const memberVotes = await this.prisma.memberVote.findMany({
      where: { voteId },
      include: {
        member: {
          include: {
            memberTerms: {
              where: { termId: vote.termId },
              include: { party: true },
              take: 1,
            },
          },
        },
      },
    });

    const result = {
      vote: {
        id: vote.id,
        billNo: vote.billNo,
        billName: vote.billName,
        committee: vote.committee,
        procDate: vote.procDate,
        procResult: vote.procResult,
        resultCode: vote.resultCode,
        yesCount: vote.yesCount,
        noCount: vote.noCount,
        abstainCount: vote.abstainCount,
        voteTotal: vote.voteTotal,
        memberTotal: vote.memberTotal,
        linkUrl: vote.linkUrl,
        termId: vote.termId,
      },
      memberVotes: memberVotes.map((mv) => {
        const term = mv.member.memberTerms[0];
        return {
          memberId: mv.memberId,
          memberName: mv.member.name,
          photoUrl: mv.member.photoUrl,
          result: mv.result,
          partyId: term?.party.id ?? 'independent',
          partyName: term?.party.name ?? '무소속',
          partyColor: term?.party.color ?? '#999999',
          district: term?.district ?? '',
        };
      }),
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async findByBillId(billId: string) {
    const key = `votes:bill:${billId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const vote = await this.prisma.vote.findUnique({ where: { id: billId } });
    if (!vote) return null;

    const result = {
      id: vote.id,
      billNo: vote.billNo,
      billName: vote.billName,
      committee: vote.committee,
      procDate: vote.procDate,
      procResult: vote.procResult,
      resultCode: vote.resultCode,
      memberTotal: vote.memberTotal,
      voteTotal: vote.voteTotal,
      yesCount: vote.yesCount,
      noCount: vote.noCount,
      abstainCount: vote.abstainCount,
      linkUrl: vote.linkUrl,
      termId: vote.termId,
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }
}
