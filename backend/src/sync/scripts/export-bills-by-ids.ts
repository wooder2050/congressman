import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 특정 bill ID 목록을 받아 재생성용 JSON 배치로 추출
 *
 * 사용법:
 *   pnpm tsx backend/src/sync/scripts/export-bills-by-ids.ts <ids-file> [batchSize]
 *
 * <ids-file>: 한 줄에 하나씩 bill id가 있는 텍스트 파일
 * batchSize: 기본 100
 *
 * export-bills.ts와 달리 원문 잘림을 막기 위해 summary를 4000자까지 보존.
 */
async function main() {
  const idsFile = process.argv[2];
  if (!idsFile) {
    console.error('[ExportBillsByIds] Usage: pnpm tsx ... <ids-file> [batchSize]');
    process.exit(1);
  }
  const batchSize = parseInt(process.argv[3] ?? '100', 10);
  if (!Number.isFinite(batchSize) || batchSize < 1) {
    console.error(`[ExportBillsByIds] Invalid batchSize: ${process.argv[3]}`);
    process.exit(1);
  }

  const resolvedIdsFile = path.resolve(idsFile);
  if (!fs.existsSync(resolvedIdsFile)) {
    console.error(`[ExportBillsByIds] IDs file not found: ${resolvedIdsFile}`);
    process.exit(1);
  }

  const ids = fs
    .readFileSync(resolvedIdsFile, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log(`[ExportBillsByIds] Loaded ${ids.length} IDs from ${resolvedIdsFile}`);

  const prisma = new PrismaClient();
  await prisma.$connect();

  const outDir = path.resolve(__dirname, '../../../data/summaries-regen');
  fs.mkdirSync(outDir, { recursive: true });

  try {
    const bills = await prisma.bill.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        summary: true,
        committee: true,
        status: true,
      },
    });

    console.log(`[ExportBillsByIds] Matched ${bills.length} / ${ids.length} bills in DB`);

    const totalBatches = Math.ceil(bills.length / batchSize);
    for (let i = 0; i < totalBatches; i++) {
      const batch = bills.slice(i * batchSize, (i + 1) * batchSize);
      const batchNum = String(i + 1).padStart(3, '0');
      const filePath = path.join(outDir, `batch-${batchNum}.json`);

      fs.writeFileSync(
        filePath,
        JSON.stringify(
          batch.map((b) => ({
            id: b.id,
            title: b.title,
            summary: b.summary?.slice(0, 4000) ?? null,
            committee: b.committee,
            status: b.status,
          })),
          null,
          2,
        ),
      );
      console.log(
        `[ExportBillsByIds] Wrote batch ${batchNum} (${batch.length} bills) → ${filePath}`,
      );
    }

    console.log(`[ExportBillsByIds] Done. ${totalBatches} batch file(s) in ${outDir}`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
