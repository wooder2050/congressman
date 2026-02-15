import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL = 60 * 60 * 24; // 24h

@Injectable()
export class TermsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redis.get<ReturnType<typeof this.mapTerms>>('terms:all');
    if (cached) return cached;

    const terms = await this.prisma.term.findMany({
      orderBy: { id: 'desc' },
    });

    const result = this.mapTerms(terms);
    await this.redis.set('terms:all', result, TTL);
    return result;
  }

  private mapTerms(terms: Awaited<ReturnType<typeof this.prisma.term.findMany>>) {
    return terms.map((t) => ({
      id: t.id,
      name: t.name,
      startDate: t.startDate.toISOString().split('T')[0],
      endDate: t.endDate.toISOString().split('T')[0],
      isCurrent: t.isCurrent,
    }));
  }
}
