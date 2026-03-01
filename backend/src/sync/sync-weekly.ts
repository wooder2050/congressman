/**
 * 주간 동기화 스크립트
 *
 * 대상: 의원 정보, 사진, 의원별 표결 전체
 * 실행: pnpm sync:weekly [termId]
 * 권장: 매주 월요일 새벽 3시 (KST)
 * 주의: member-votes 전체 동기화는 약 1시간 소요
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { AssemblyApiService } from './services/assembly-api.service';
import { SyncLogService } from './services/sync-log.service';
import { MemberSyncService } from './services/member-sync.service';
import { PhotoSyncService } from './services/photo-sync.service';
import { MemberVoteSyncService } from './services/member-vote-sync.service';

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
        console.log(`[Weekly] Invalidated ${keys.length} keys (${prefix}*)`);
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

  console.log(`[Weekly] Starting weekly sync for term ${termId}`);

  const results: { task: string; ok: boolean; ms: number; error?: string }[] = [];

  const tasks: { name: string; run: () => Promise<void> }[] = [
    { name: 'members', run: () => new MemberSyncService(prisma, api, syncLog).syncMembers(termId) },
    { name: 'photos', run: () => new PhotoSyncService(prisma, api).syncPhotos(termId) },
    {
      name: 'member-votes-full',
      run: () => new MemberVoteSyncService(prisma, api, syncLog).syncMemberVotes(termId, 365 * 5),
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
      console.error(`[Weekly] ${task.name} failed: ${msg}`);
    }
  }

  await invalidateCache(['terms:', 'members:', 'member:']);

  const totalMs = Date.now() - start;
  const failed = results.filter((r) => !r.ok);

  console.log('\n[Weekly] === Summary ===');
  for (const r of results) {
    console.log(
      `  ${r.ok ? '✓' : '✗'} ${r.task} (${(r.ms / 1000).toFixed(1)}s)${r.error ? ` — ${r.error}` : ''}`,
    );
  }
  console.log(
    `[Weekly] Total: ${(totalMs / 1000).toFixed(1)}s, Failed: ${failed.length}/${results.length}`,
  );

  // GitHub Actions Summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('fs');
    const lines = [
      '## Weekly Sync Summary',
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
