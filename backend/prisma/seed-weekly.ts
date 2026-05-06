import { PrismaClient, Prisma } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { getAllWeeklyArticles } from '../../frontend/src/data/weekly';
import type { WeeklyArticle } from '../../frontend/src/data/weekly/types';

const prisma = new PrismaClient();

const REDIS_LIST_KEY = 'weekly:list';
const REDIS_ITEM_PREFIX = 'weekly:item:';
const ABSOLUTE_DELETE_LIMIT = 5;
const RELATIVE_DELETE_LIMIT = 0.3; // 30%

const ID_REGEX = /^\d{4}-\d{2}-w\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function assertValid(items: WeeklyArticle[]): void {
  if (items.length === 0) {
    throw new Error('Source array is empty — refusing to wipe DB');
  }
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id) throw new Error(`Entry missing id: ${JSON.stringify(item).slice(0, 100)}`);
    if (!ID_REGEX.test(item.id)) {
      throw new Error(`Invalid id format (expected YYYY-MM-wN) for id=${item.id}`);
    }
    if (ids.has(item.id)) throw new Error(`Duplicate id: ${item.id}`);
    ids.add(item.id);
    if (!DATE_REGEX.test(item.publishedDate)) {
      throw new Error(
        `Invalid publishedDate format (expected YYYY-MM-DD) for id=${item.id}: ${item.publishedDate}`,
      );
    }
    const parsed = new Date(item.publishedDate);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== item.publishedDate
    ) {
      throw new Error(
        `Invalid publishedDate (does not roundtrip) for id=${item.id}: ${item.publishedDate}`,
      );
    }
    if (!item.title || !item.period || !item.summary) {
      throw new Error(`Missing required field (title/period/summary) for id=${item.id}`);
    }
  }
}

async function invalidateCache(ids: string[]): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.log('[Seed:Weekly] Redis credentials not set — skipping cache invalidation');
    return;
  }
  try {
    const redis = new Redis({ url, token });
    const itemKeys = ids.map((id) => `${REDIS_ITEM_PREFIX}${id}`);
    const allKeys = [REDIS_LIST_KEY, ...itemKeys];
    await redis.del(...allKeys);
    console.log(`[Seed:Weekly] Invalidated ${allKeys.length} cache keys`);
  } catch (err) {
    console.warn('[Seed:Weekly] Cache invalidation failed (TTL applies):', err);
  }
}

async function main() {
  const articles = getAllWeeklyArticles();
  console.log(`[Seed:Weekly] Source has ${articles.length} entries`);
  assertValid(articles);

  const sourceIds = new Set(articles.map((a) => a.id));
  const existing = await prisma.weeklyArticle.findMany({ select: { id: true } });
  const staleIds = existing.filter((e) => !sourceIds.has(e.id)).map((e) => e.id);

  if (staleIds.length > ABSOLUTE_DELETE_LIMIT) {
    console.error(
      `[Seed:Weekly] Refusing to delete ${staleIds.length} entries (limit ${ABSOLUTE_DELETE_LIMIT}):`,
    );
    console.error(staleIds);
    throw new Error(
      `Stale delete count ${staleIds.length} exceeds absolute limit ${ABSOLUTE_DELETE_LIMIT}`,
    );
  }
  if (existing.length > 0 && staleIds.length / existing.length > RELATIVE_DELETE_LIMIT) {
    throw new Error(
      `Stale delete ratio ${((staleIds.length / existing.length) * 100).toFixed(1)}% exceeds ${RELATIVE_DELETE_LIMIT * 100}%`,
    );
  }
  if (staleIds.length > 0) {
    console.log(
      `[Seed:Weekly] Will remove ${staleIds.length} stale entries: ${staleIds.join(', ')}`,
    );
  }

  const upsertOps = articles.map((item) => {
    const data = {
      title: item.title,
      period: item.period,
      publishedDate: new Date(item.publishedDate),
      summary: item.summary,
      tags: item.tags ?? [],
      featuredBills: (item.featuredBills ?? []) as unknown as Prisma.InputJsonValue,
      highlights: (item.highlights ?? []) as unknown as Prisma.InputJsonValue,
      stats: (item.stats ?? null) as unknown as Prisma.InputJsonValue,
      analysis: item.analysis ?? null,
    };
    return prisma.weeklyArticle.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    });
  });

  const deleteOp =
    staleIds.length > 0
      ? [prisma.weeklyArticle.deleteMany({ where: { id: { in: staleIds } } })]
      : [];

  await prisma.$transaction([...upsertOps, ...deleteOp]);
  console.log(`[Seed:Weekly] Upserted ${articles.length}, removed ${staleIds.length}`);

  const allIds = [...articles.map((a) => a.id), ...staleIds];
  await invalidateCache(allIds);
}

main()
  .catch((e) => {
    console.error('[Seed:Weekly] Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
