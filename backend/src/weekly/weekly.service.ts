import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface ArticleSection {
  heading: string;
  body: string;
}

interface FeaturedBill {
  title: string;
  slug?: string;
  billId?: string;
  status: 'passed' | 'pending' | 'committee' | 'rejected';
  description: string;
  article?: ArticleSection[];
  proposer?: string;
  voteResult?: { yes: number; no: number; abstain: number };
  sources?: { title: string; url: string; type?: 'article' | 'youtube' }[];
}

interface WeeklyHighlight {
  category: 'vote' | 'bill' | 'committee' | 'politics' | 'economy';
  title: string;
  description: string;
  slug?: string;
  article?: ArticleSection[];
}

interface WeeklyStats {
  billsPassed?: number;
  billsProposed?: number;
  votesHeld?: number;
  committeeMeetings?: number;
}

export interface WeeklyArticleSummary {
  id: string;
  title: string;
  period: string;
  publishedDate: string;
  summary: string;
  tags: string[];
  stats?: WeeklyStats;
  featuredBills: FeaturedBill[];
}

export interface WeeklyArticleDetail extends WeeklyArticleSummary {
  highlights: WeeklyHighlight[];
  analysis?: string;
}

const LIST_CACHE_KEY = 'weekly:list';
const ITEM_CACHE_PREFIX = 'weekly:item:';
const CACHE_TTL = 300; // 5분

@Injectable()
export class WeeklyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(): Promise<WeeklyArticleSummary[]> {
    const cached = await this.redis.get<WeeklyArticleSummary[]>(LIST_CACHE_KEY);
    if (cached) return cached;

    const rows = await this.prisma.weeklyArticle.findMany({
      orderBy: { publishedDate: 'desc' },
      select: {
        id: true,
        title: true,
        period: true,
        publishedDate: true,
        summary: true,
        tags: true,
        stats: true,
        featuredBills: true,
      },
    });

    const result: WeeklyArticleSummary[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      period: row.period,
      publishedDate: row.publishedDate.toISOString().slice(0, 10),
      summary: row.summary,
      tags: row.tags,
      stats: (row.stats as unknown as WeeklyStats | null) ?? undefined,
      featuredBills: (row.featuredBills as unknown as FeaturedBill[]) ?? [],
    }));

    await this.redis.set(LIST_CACHE_KEY, result, CACHE_TTL);
    return result;
  }

  async findOne(id: string): Promise<WeeklyArticleDetail> {
    const cacheKey = `${ITEM_CACHE_PREFIX}${id}`;
    const cached = await this.redis.get<WeeklyArticleDetail>(cacheKey);
    if (cached) return cached;

    const row = await this.prisma.weeklyArticle.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Weekly article not found: ${id}`);
    }

    const result: WeeklyArticleDetail = {
      id: row.id,
      title: row.title,
      period: row.period,
      publishedDate: row.publishedDate.toISOString().slice(0, 10),
      summary: row.summary,
      tags: row.tags,
      stats: (row.stats as unknown as WeeklyStats | null) ?? undefined,
      featuredBills: (row.featuredBills as unknown as FeaturedBill[]) ?? [],
      highlights: (row.highlights as unknown as WeeklyHighlight[]) ?? [],
      analysis: row.analysis ?? undefined,
    };

    await this.redis.set(cacheKey, result, CACHE_TTL);
    return result;
  }
}
