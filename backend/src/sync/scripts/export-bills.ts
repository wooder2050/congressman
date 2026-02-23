import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DB에서 법안 데이터를 추출하여 JSON 파일로 저장
 * Claude Code가 요약을 생성할 수 있도록 배치별로 분할
 *
 * 사용법: pnpm tsx backend/src/sync/scripts/export-bills.ts [batchSize]
 */
async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const batchSize = parseInt(process.argv[2] ?? '100', 10);
  if (!Number.isFinite(batchSize) || batchSize < 1) {
    console.error(
      `[ExportBills] Invalid batchSize: ${process.argv[2]}. Must be a positive integer.`,
    );
    process.exit(1);
  }
  const outDir = path.resolve(__dirname, '../../../data/summaries');
  fs.mkdirSync(outDir, { recursive: true });

  try {
    // simpleSummary가 아직 없는 법안만 추출
    const bills = await prisma.bill.findMany({
      where: {
        termId: 22,
        simpleSummary: null,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        committee: true,
        status: true,
      },
      orderBy: { proposedDate: 'desc' },
    });

    console.log(`[ExportBills] Total bills without summary: ${bills.length}`);

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
            summary: b.summary?.slice(0, 2000) ?? null, // 너무 긴 원문은 잘라냄
            committee: b.committee,
            status: b.status,
          })),
          null,
          2,
        ),
      );

      console.log(`[ExportBills] Wrote batch ${batchNum} (${batch.length} bills) → ${filePath}`);
    }

    console.log(`[ExportBills] Done. ${totalBatches} batch files created in ${outDir}`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
