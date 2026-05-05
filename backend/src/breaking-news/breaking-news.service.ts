import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface BreakingNewsDetail {
  label: string;
  value: string;
  memberId?: string;
}

interface BreakingNewsSource {
  title: string;
  url: string;
}

export interface BreakingNewsResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'committee' | 'election' | 'legislation' | 'politics';
  items?: BreakingNewsDetail[];
  sources?: BreakingNewsSource[];
  linkUrl?: string;
  active: boolean;
}

const CACHE_KEY = 'breaking-news:active';
const CACHE_TTL = 300; // 5분

@Injectable()
export class BreakingNewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findActive(): Promise<BreakingNewsResponse[]> {
    const cached = await this.redis.get<BreakingNewsResponse[]>(CACHE_KEY);
    if (cached) return cached;

    const rows = await this.prisma.breakingNews.findMany({
      where: { active: true },
      orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const result = rows.map(this.toResponse);
    await this.redis.set(CACHE_KEY, result, CACHE_TTL);
    return result;
  }

  async invalidateCache(): Promise<void> {
    await this.redis.del(CACHE_KEY);
  }

  private toResponse(row: {
    id: string;
    title: string;
    description: string;
    date: Date;
    category: string;
    items: unknown;
    sources: unknown;
    linkUrl: string | null;
    active: boolean;
  }): BreakingNewsResponse {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date.toISOString().split('T')[0],
      category: row.category as BreakingNewsResponse['category'],
      items: (row.items as BreakingNewsDetail[]) ?? [],
      sources: (row.sources as BreakingNewsSource[]) ?? [],
      linkUrl: row.linkUrl ?? undefined,
      active: row.active,
    };
  }
}
