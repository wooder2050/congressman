import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TermsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const terms = await this.prisma.term.findMany({
      orderBy: { id: 'desc' },
    });

    return terms.map((t) => ({
      id: t.id,
      name: t.name,
      startDate: t.startDate.toISOString().split('T')[0],
      endDate: t.endDate.toISOString().split('T')[0],
      isCurrent: t.isCurrent,
    }));
  }
}
