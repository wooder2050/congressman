/**
 * 매일 동기화 스크립트
 *
 * 대상: 법안, 본회의 표결, 의원별 표결(최근 7일), 출석, 일정
 * 실행: pnpm sync:daily [termId]
 * 권장: 매일 새벽 4시 (KST)
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { AssemblyApiService } from './services/assembly-api.service';
import { SyncLogService } from './services/sync-log.service';
import { BillSyncService } from './services/bill-sync.service';
import { ExtraBillSyncService } from './services/extra-bill-sync.service';
import { VoteSyncService } from './services/vote-sync.service';
import { MemberVoteSyncService } from './services/member-vote-sync.service';
import { AttendanceSyncService } from './services/attendance-sync.service';
import { BillContentSyncService } from './services/bill-content-sync.service';
import { ScheduleSyncService } from './services/schedule-sync.service';
import { BillJudgeSyncService } from './services/bill-judge-sync.service';

async function invalidateCache(prefixes: string[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  const redis = new Redis({ url, token });
  for (const prefix of prefixes) {
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: `${prefix}*`, count: 100 });
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[Daily] Invalidated ${keys.length} keys (${prefix}*)`);
      }
      cursor = Number(nextCursor);
    } while (cursor !== 0);
  }
}

async function main() {
  const start = Date.now();
  const prisma = new PrismaClient();
  await prisma.$connect();

  const api = new AssemblyApiService();
  const syncLog = new SyncLogService(prisma);
  const parsed = parseInt(process.argv[2] ?? '22', 10);
  const termId = Number.isInteger(parsed) && parsed > 0 ? parsed : 22;

  console.log(`[Daily] Starting daily sync for term ${termId}`);

  const results: { task: string; ok: boolean; ms: number; error?: string }[] = [];

  const tasks: { name: string; run: () => Promise<void> }[] = [
    { name: 'bills', run: () => new BillSyncService(prisma, api, syncLog).syncBills(termId) },
    {
      name: 'extra-bills',
      run: () => new ExtraBillSyncService(prisma, api, syncLog).syncExtraBills(termId),
    },
    { name: 'votes', run: () => new VoteSyncService(prisma, api, syncLog).syncVotes(termId) },
    {
      name: 'member-votes',
      run: () => new MemberVoteSyncService(prisma, api, syncLog).syncMemberVotes(termId, 7),
    },
    {
      name: 'bill-content',
      run: () => new BillContentSyncService(prisma, syncLog).syncBillContent(termId),
    },
    {
      name: 'attendance',
      run: () => new AttendanceSyncService(prisma, syncLog).syncAttendance(termId),
    },
    {
      name: 'schedules',
      run: () => new ScheduleSyncService(prisma, api, syncLog).syncSchedules(termId),
    },
    {
      name: 'bill-judge',
      run: () => new BillJudgeSyncService(prisma, api, syncLog).syncBillJudge(termId),
    },
  ];

  for (const task of tasks) {
    const t0 = Date.now();
    try {
      await task.run();
      results.push({ task: task.name, ok: true, ms: Date.now() - t0 });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({ task: task.name, ok: false, ms: Date.now() - t0, error: msg });
      console.error(`[Daily] ${task.name} failed: ${msg}`);
    }
  }

  await invalidateCache([
    'bills:',
    'bill:',
    'votes:',
    'vote:',
    'member:votes:',
    'member:history:',
    'attendance:',
    'schedules:',
    'committees:',
  ]);

  const totalMs = Date.now() - start;
  const failed = results.filter((r) => !r.ok);

  console.log('\n[Daily] === Summary ===');
  for (const r of results) {
    console.log(
      `  ${r.ok ? '✓' : '✗'} ${r.task} (${(r.ms / 1000).toFixed(1)}s)${r.error ? ` — ${r.error}` : ''}`,
    );
  }
  console.log(
    `[Daily] Total: ${(totalMs / 1000).toFixed(1)}s, Failed: ${failed.length}/${results.length}`,
  );

  // GitHub Actions Summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('fs');
    const lines = [
      '## Daily Sync Summary',
      '',
      '| Task | Status | Duration |',
      '|------|--------|----------|',
      ...results.map(
        (r) => `| ${r.task} | ${r.ok ? 'OK' : 'FAIL'} | ${(r.ms / 1000).toFixed(1)}s |`,
      ),
      '',
      `**Total**: ${(totalMs / 1000).toFixed(1)}s | **Failed**: ${failed.length}/${results.length}`,
    ];
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
  }

  await prisma.$disconnect();

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main();
