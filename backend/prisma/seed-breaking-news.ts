import { PrismaClient, Prisma } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { breakingNews } from '../../frontend/src/data/breaking-news';
import type { BreakingNewsItem } from '../../frontend/src/data/breaking-news/types';

const prisma = new PrismaClient();

const REDIS_CACHE_KEY = 'breaking-news:active';
const ABSOLUTE_DELETE_LIMIT = 5;
const RELATIVE_DELETE_LIMIT = 0.3; // 30%

function assertValid(items: BreakingNewsItem[]): void {
  if (items.length === 0) {
    throw new Error('Source array is empty — refusing to wipe DB');
  }
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id) throw new Error(`Entry missing id: ${JSON.stringify(item).slice(0, 100)}`);
    if (ids.has(item.id)) throw new Error(`Duplicate id: ${item.id}`);
    ids.add(item.id);
    if (Number.isNaN(new Date(item.date).getTime())) {
      throw new Error(`Invalid date for id=${item.id}: ${item.date}`);
    }
    if (!['committee', 'election', 'legislation', 'politics'].includes(item.category)) {
      throw new Error(`Invalid category for id=${item.id}: ${item.category}`);
    }
  }
}

async function invalidateCache(): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.log('[Seed:BreakingNews] Redis credentials not set — skipping cache invalidation');
    return;
  }
  const redis = new Redis({ url, token });
  await redis.del(REDIS_CACHE_KEY);
  console.log(`[Seed:BreakingNews] Invalidated cache: ${REDIS_CACHE_KEY}`);
}

async function main() {
  console.log(`[Seed:BreakingNews] Source has ${breakingNews.length} entries`);
  assertValid(breakingNews);

  const sourceIds = new Set(breakingNews.map((n) => n.id));
  const existing = await prisma.breakingNews.findMany({ select: { id: true } });
  const staleIds = existing.filter((e) => !sourceIds.has(e.id)).map((e) => e.id);

  if (staleIds.length > ABSOLUTE_DELETE_LIMIT) {
    console.error(`[Seed:BreakingNews] Refusing to delete ${staleIds.length} entries (limit ${ABSOLUTE_DELETE_LIMIT}):`);
    console.error(staleIds);
    throw new Error(`Stale delete count ${staleIds.length} exceeds absolute limit ${ABSOLUTE_DELETE_LIMIT}`);
  }
  if (existing.length > 0 && staleIds.length / existing.length > RELATIVE_DELETE_LIMIT) {
    throw new Error(
      `Stale delete ratio ${((staleIds.length / existing.length) * 100).toFixed(1)}% exceeds ${RELATIVE_DELETE_LIMIT * 100}%`,
    );
  }
  if (staleIds.length > 0) {
    console.log(`[Seed:BreakingNews] Will remove ${staleIds.length} stale entries: ${staleIds.join(', ')}`);
  }

  const upsertOps = breakingNews.map((item, i) => {
    const data = {
      title: item.title,
      description: item.description,
      date: new Date(item.date),
      category: item.category,
      items: (item.items ?? []) as unknown as Prisma.InputJsonValue,
      sources: (item.sources ?? []) as unknown as Prisma.InputJsonValue,
      linkUrl: item.linkUrl ?? null,
      active: item.active,
      sortOrder: i,
    };
    return prisma.breakingNews.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    });
  });

  const deleteOp =
    staleIds.length > 0
      ? [prisma.breakingNews.deleteMany({ where: { id: { in: staleIds } } })]
      : [];

  await prisma.$transaction([...upsertOps, ...deleteOp]);
  console.log(`[Seed:BreakingNews] Upserted ${breakingNews.length}, removed ${staleIds.length}`);

  await invalidateCache();
}

main()
  .catch((e) => {
    console.error('[Seed:BreakingNews] Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
