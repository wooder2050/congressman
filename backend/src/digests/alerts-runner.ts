/**
 * Lawmake Radar 다이제스트 배치 CLI. GitHub Actions/수동 실행.
 *
 * 사용법:
 *   pnpm alerts:build   → 이번 기간 Digest 빌드(발송 안 함)
 *   pnpm alerts:send    → 빌드된 Digest 발송(mode/캡 적용)
 *   pnpm alerts:weekly  → build 후 send(주간 배치)
 *
 * flag RADAR_DIGEST_ENABLED=true여야 동작(기본 OFF → no-op).
 * 발송 mode는 RADAR_EMAIL_MODE(DRY_RUN/ALLOWLIST/LIVE), 기본 DRY_RUN.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { DigestBuildService } from './digest-build.service';
import { DigestSendService } from './digest-send.service';
import { createSupabaseEmailLookup, isDigestEnabled, loadSendConfig } from './digest-config';
import { createEmailSenderFromEnv } from './email-sender';
import { SyncLogService } from '../sync/services/sync-log.service';

async function runBuild(
  prisma: PrismaClient,
  syncLog: SyncLogService,
  dryRun: boolean,
): Promise<void> {
  const log = await syncLog.start('radar-digest-build');
  try {
    const svc = new DigestBuildService(prisma);
    const res = await svc.build(new Date(), dryRun);
    console.log(
      `[Alerts:build] period=${res.periodKey} run=${res.digestRunId} ` +
        `usersWithChanges=${res.usersWithChanges} digestsCreated=${res.digestsCreated} status=${res.status}`,
    );
    // recordCount에 생성된 Digest 수를 남겨 운영자가 SyncLog로 발송 대상 규모를 확인.
    await syncLog.complete(log.id, res.digestsCreated);
  } catch (e) {
    await syncLog.fail(log.id, e instanceof Error ? e.message : String(e));
    throw e;
  }
}

async function runSend(prisma: PrismaClient, syncLog: SyncLogService): Promise<void> {
  const log = await syncLog.start('radar-digest-send');
  try {
    const config = loadSendConfig();
    const sender = createEmailSenderFromEnv();
    const lookup = createSupabaseEmailLookup();
    const svc = new DigestSendService(prisma, sender, lookup);
    const res = await svc.send(config);
    console.log(
      `[Alerts:send] mode=${config.mode} sender=${sender.mode} cap=${config.maxEmailsPerRun} ` +
        `candidates=${res.candidates} sent=${res.sent} suppressed=${res.suppressed} ` +
        `failed=${res.failed} deferred=${res.deferred} skippedByCap=${res.skippedByCap}`,
    );
    // 부분 실패(발송 실패 or 조회 지연)면 SyncLog를 fail로 남기고 에러를 throw한다.
    // → GitHub Actions가 실패 알림·즉시 재시도를 트리거해, 미해결분이 다음 '주간' run까지
    //   방치되어 Resend 멱등키(24h) 만료 후 중복 발송되는 위험을 막는다.
    if (res.failed > 0 || res.deferred > 0) {
      const msg = `sent=${res.sent} failed=${res.failed} deferred=${res.deferred} (부분 실패)`;
      await syncLog.fail(log.id, msg);
      throw new Error(`[Alerts:send] partial failure — ${msg}`);
    }
    await syncLog.complete(log.id, res.sent);
  } catch (e) {
    // 이미 fail 처리된 경우 중복 update는 무해(같은 상태). 미처리 예외만 여기서 기록.
    await syncLog.fail(log.id, e instanceof Error ? e.message : String(e)).catch(() => {});
    throw e;
  }
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'weekly';

  if (!isDigestEnabled()) {
    console.log('[Alerts] RADAR_DIGEST_ENABLED != true → skip (no-op)');
    return;
  }

  // 빌드 시 dry-run 여부: 발송 mode가 DRY_RUN이면 Digest도 PREVIEW로 만든다.
  const buildDryRun = (process.env.RADAR_EMAIL_MODE ?? 'DRY_RUN').toUpperCase() === 'DRY_RUN';

  const prisma = new PrismaClient();
  await prisma.$connect();
  const syncLog = new SyncLogService(prisma);
  try {
    console.log(`[Alerts] command="${command}"`);
    switch (command) {
      case 'build':
        await runBuild(prisma, syncLog, buildDryRun);
        break;
      case 'send':
        await runSend(prisma, syncLog);
        break;
      case 'weekly':
        await runBuild(prisma, syncLog, buildDryRun);
        await runSend(prisma, syncLog);
        break;
      default:
        console.error(`[Alerts] unknown command: ${command}`);
        process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('[Alerts] fatal:', e);
  process.exit(1);
});
