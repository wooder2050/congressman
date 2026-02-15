import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './services/assembly-api.service';
import { SyncLogService } from './services/sync-log.service';
import { MemberSyncService } from './services/member-sync.service';
import { BillSyncService } from './services/bill-sync.service';

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const api = new AssemblyApiService();
  const syncLog = new SyncLogService(prisma);
  const memberSync = new MemberSyncService(prisma, api, syncLog);
  const billSync = new BillSyncService(prisma, api, syncLog);

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
      case 'all':
      default:
        await memberSync.syncMembers(termId);
        await billSync.syncBills(termId);
        break;
    }
    console.log('[SyncRunner] Sync completed successfully');
  } catch (error) {
    console.error('[SyncRunner] Sync failed', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
