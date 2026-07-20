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

async function runBuild(prisma: PrismaClient, dryRun: boolean): Promise<void> {
  const svc = new DigestBuildService(prisma);
  const res = await svc.build(new Date(), dryRun);
  console.log(
    `[Alerts:build] period=${res.periodKey} run=${res.digestRunId} ` +
      `usersWithChanges=${res.usersWithChanges} digestsCreated=${res.digestsCreated} status=${res.status}`,
  );
}

async function runSend(prisma: PrismaClient): Promise<void> {
  const config = loadSendConfig();
  const sender = createEmailSenderFromEnv();
  const lookup = createSupabaseEmailLookup();
  const svc = new DigestSendService(prisma, sender, lookup);
  const res = await svc.send(config);
  console.log(
    `[Alerts:send] mode=${config.mode} sender=${sender.mode} cap=${config.maxEmailsPerRun} ` +
      `candidates=${res.candidates} sent=${res.sent} suppressed=${res.suppressed} ` +
      `failed=${res.failed} skippedByCap=${res.skippedByCap}`,
  );
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
  try {
    console.log(`[Alerts] command="${command}"`);
    switch (command) {
      case 'build':
        await runBuild(prisma, buildDryRun);
        break;
      case 'send':
        await runSend(prisma);
        break;
      case 'weekly':
        await runBuild(prisma, buildDryRun);
        await runSend(prisma);
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
