import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface FindAllParams {
  termId?: number;
  memberId?: string;
  status?: string;
  page: number;
  limit: number;
}

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllParams) {
    const where: Prisma.BillWhereInput = {};

    if (params.termId) where.termId = params.termId;
    if (params.status) where.status = params.status;
    if (params.memberId) {
      where.proposers = { some: { memberId: params.memberId } };
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

    return {
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
  }
}
