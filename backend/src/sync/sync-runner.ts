import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { AssemblyApiService } from './services/assembly-api.service';
import { SyncLogService } from './services/sync-log.service';
import { MemberSyncService } from './services/member-sync.service';
import { BillSyncService } from './services/bill-sync.service';
import { VoteSyncService } from './services/vote-sync.service';
import { PhotoSyncService } from './services/photo-sync.service';

async function invalidateCache(command: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.log('[SyncRunner] Redis not configured, skipping cache invalidation');
    return;
  }

  const redis = new Redis({ url, token });
  const prefixes: string[] = [];

  if (command === 'members' || command === 'all') {
    prefixes.push('terms:', 'members:', 'member:');
  }
  if (command === 'bills' || command === 'all') {
    prefixes.push('bills:', 'member:history:');
  }
  if (command === 'votes' || command === 'all') {
    prefixes.push('votes:');
  }
  if (command === 'photos') {
    prefixes.push('members:', 'member:');
  }

  for (const prefix of prefixes) {
    const scanAndDelete = async (cur: number): Promise<number> => {
      const [nextCursor, keys] = await redis.scan(cur, { match: `${prefix}*`, count: 100 });
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[SyncRunner] Invalidated ${keys.length} cache keys (${prefix}*)`);
      }
      return Number(nextCursor);
    };

    let cursor = await scanAndDelete(0);
    while (cursor !== 0) {
      cursor = await scanAndDelete(cursor);
    }
  }
}

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const api = new AssemblyApiService();
  const syncLog = new SyncLogService(prisma);
  const memberSync = new MemberSyncService(prisma, api, syncLog);
  const billSync = new BillSyncService(prisma, api, syncLog);
  const voteSync = new VoteSyncService(prisma, api, syncLog);
  const photoSync = new PhotoSyncService(prisma, api);

  const command = process.argv[2] ?? 'all';
  const termId = parseInt(process.argv[3] ?? '22', 10);

  console.log(`[SyncRunner] Running sync: "${command}" for term ${termId}`);

  try {
    switch (command) {
      case 'members':
        await memberSync.syncMembers(termId);
        break;
      case 'bills':
        await billSync.syncBills(termId);
        break;
      case 'votes':
        await voteSync.syncVotes(termId);
        break;
      case 'photos':
        await photoSync.syncPhotos(termId);
        break;
      case 'all':
      default:
        await memberSync.syncMembers(termId);
        await billSync.syncBills(termId);
        await voteSync.syncVotes(termId);
        break;
    }

    await invalidateCache(command);
    console.log('[SyncRunner] Sync completed successfully');
  } catch (error) {
    console.error('[SyncRunner] Sync failed', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
