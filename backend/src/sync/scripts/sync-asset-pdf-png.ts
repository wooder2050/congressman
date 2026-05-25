import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import { AssetPdfPngSyncService, CandidateTable } from '../services/asset-pdf-png-sync.service';
import { SyncLogService } from '../services/sync-log.service';

/**
 * NEC 재산신고서 PDF → PNG 변환 sync 실행기
 *
 * 사용법:
 *   pnpm tsx backend/src/sync/scripts/sync-asset-pdf-png.ts <table> [옵션]
 *
 * table:
 *   local       지방선거 후보(LocalElectionCandidate)
 *   by          재보궐 후보(Candidate)
 *
 * 옵션:
 *   --limit <n>                 최대 처리 수 (기본 전체)
 *   --concurrency <n>           동시 처리 수 (기본 3)
 *   --ids 1,2,3                 특정 후보 ID만
 *
 * 예시:
 *   pnpm tsx backend/src/sync/scripts/sync-asset-pdf-png.ts local --limit 5
 *   pnpm tsx backend/src/sync/scripts/sync-asset-pdf-png.ts by --ids 12,13,14
 */
async function main() {
  const table = process.argv[2] as 'local' | 'by' | undefined;
  if (table !== 'local' && table !== 'by') {
    console.error('Usage: pnpm tsx ... <local|by> [--limit N] [--concurrency N] [--ids 1,2,3]');
    process.exit(1);
  }

  const args = process.argv.slice(3);
  const limit = parseIntArg(args, '--limit');
  const concurrency = parseIntArg(args, '--concurrency') ?? 3;
  const idsArg = parseStringArg(args, '--ids');
  const candidateIds = idsArg
    ? idsArg
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n))
    : undefined;

  const tableName: CandidateTable = table === 'local' ? 'localElectionCandidate' : 'candidate';

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    const syncLog = new SyncLogService(prisma);
    const service = new AssetPdfPngSyncService(prisma, syncLog);
    const counters = await service.sync(tableName, { limit, concurrency, candidateIds });
    console.log(
      `[Done] processed=${counters.processed}, updated=${counters.updated}, skipped=${counters.skipped}, failed=${counters.failed}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

function parseIntArg(args: string[], flag: string): number | undefined {
  const i = args.indexOf(flag);
  if (i < 0 || i + 1 >= args.length) return undefined;
  const n = parseInt(args[i + 1], 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseStringArg(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  if (i < 0 || i + 1 >= args.length) return undefined;
  return args[i + 1];
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
