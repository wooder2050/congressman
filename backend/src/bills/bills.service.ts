import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

interface FindAllParams {
  termId?: number;
  memberId?: string;
  role?: string; // "representative" | "co"
  status?: string;
  search?: string;
  month?: string; // YYYY-MM
  committee?: string;
  page: number;
  limit: number;
}

const TTL_HOUR = 60 * 60; // 1h
const TTL_DAY = 24 * 60 * 60; // 24h

@Injectable()
export class BillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: FindAllParams) {
    const key = `bills:${params.termId ?? ''}:${params.memberId ?? ''}:${params.role ?? ''}:${params.status ?? ''}:${params.search ?? ''}:${params.month ?? ''}:${params.committee ?? ''}:${params.page}:${params.limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const where: Prisma.BillWhereInput = {};

    if (params.termId) where.termId = params.termId;
    if (params.status) where.status = params.status;
    if (params.search) where.title = { contains: params.search, mode: 'insensitive' };
    if (params.memberId) {
      where.proposers = {
        some: {
          memberId: params.memberId,
          ...(params.role ? { role: params.role } : {}),
        },
      };
    }
    if (params.month) {
      where.proposedDate = { startsWith: params.month };
    }
    if (params.committee) {
      where.committee = params.committee;
    }

    const [bills, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        include: { proposers: true },
        orderBy: { proposedDate: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.bill.count({ where }),
    ]);

    const result = {
      bills: bills.map((b) => ({
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
      total,
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getSummary(termId: number) {
    const key = `bills:summary:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [total, passed, pending, discarded, committee] = await Promise.all([
      this.prisma.bill.count({ where: { termId } }),
      this.prisma.bill.count({ where: { termId, status: 'passed' } }),
      this.prisma.bill.count({ where: { termId, status: 'pending' } }),
      this.prisma.bill.count({ where: { termId, status: 'discarded' } }),
      this.prisma.bill.count({ where: { termId, status: 'committee' } }),
    ]);

    const result = { total, passed, pending, discarded, committee };
    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getCommittees(termId: number): Promise<string[]> {
    const key = `bills:committees:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached as string[];

    const rows = await this.prisma.bill.findMany({
      where: { termId, committee: { not: null } },
      select: { committee: true },
      distinct: ['committee'],
      orderBy: { committee: 'asc' },
    });

    const result = rows.map((r) => r.committee!).filter((c) => !c.includes('특별위원회'));

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async findAllIds() {
    const key = 'bills:all-ids';
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const bills = await this.prisma.bill.findMany({
      select: { id: true, proposedDate: true },
      orderBy: { proposedDate: 'desc' },
    });

    const result = bills.map((b) => ({ id: b.id, proposedDate: b.proposedDate }));
    await this.redis.set(key, result, TTL_DAY);
    return result;
  }

  async findById(id: string) {
    const key = `bill:${id}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [bill, voteExists] = await Promise.all([
      this.prisma.bill.findUnique({ where: { id } }),
      this.prisma.vote.findUnique({ where: { id }, select: { id: true } }),
    ]);
    if (!bill) return null;

    const proposers = await this.prisma.billProposer.findMany({
      where: { billId: id },
      include: {
        member: {
          include: {
            memberTerms: {
              where: { termId: bill.termId },
              include: { party: true },
              take: 1,
            },
          },
        },
      },
    });

    const result = {
      id: bill.id,
      title: bill.title,
      proposerName: bill.proposerName,
      coProposerCount: bill.coProposerCount,
      status: bill.status,
      proposedDate: bill.proposedDate,
      termId: bill.termId,
      committee: bill.committee,
      hasVote: !!voteExists,
      summary: bill.summary ?? null,
      pdfUrl: bill.pdfBookId
        ? `https://likms.assembly.go.kr/filegate/servlet/FileGate?bookId=${bill.pdfBookId}&type=1`
        : null,
      detailLink:
        bill.detailLink ?? `https://likms.assembly.go.kr/bill/billDetail.do?billId=${bill.id}`,
      proposers: proposers.map((p) => {
        const term = p.member.memberTerms[0];
        return {
          memberId: p.memberId,
          memberName: p.member.name,
          photoUrl: p.member.photoUrl,
          role: p.role,
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
}
