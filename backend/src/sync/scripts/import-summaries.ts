import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { Redis } from '@upstash/redis';
import * as fs from 'fs';
import * as path from 'path';

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

interface BillSummaryData {
  id: string;
  simpleSummary: string;
  structuredSummary: {
    situation: string;
    problem: string;
    change: string;
    impact: string;
  };
  topic: string;
}

/**
 * JSON 파일에서 AI 요약 데이터를 읽어 DB에 삽입
 * 기존 데이터(summary, pdfBookId 등)는 건드리지 않고 새 필드만 업데이트
 *
 * 사용법: pnpm tsx backend/src/sync/scripts/import-summaries.ts [파일경로 또는 디렉토리]
 * 예시:
 *   pnpm tsx backend/src/sync/scripts/import-summaries.ts                          # data/summaries/ 전체
 *   pnpm tsx backend/src/sync/scripts/import-summaries.ts backend/data/summaries/batch-001-summaries.json  # 특정 파일
 */
async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const target = process.argv[2] ?? path.resolve(__dirname, '../../../data/summaries');
  const resolvedTarget = path.resolve(target);

  let jsonFiles: string[] = [];

  if (!fs.existsSync(resolvedTarget)) {
    console.error(`[ImportSummaries] Path not found: ${resolvedTarget}`);
    process.exit(1);
  }

  if (fs.statSync(resolvedTarget).isDirectory()) {
    jsonFiles = fs
      .readdirSync(resolvedTarget)
      .filter((f) => f.endsWith('-summaries.json'))
      .sort()
      .map((f) => path.join(resolvedTarget, f));
  } else {
    jsonFiles = [resolvedTarget];
  }

  if (jsonFiles.length === 0) {
    console.log('[ImportSummaries] No summary files found');
    return;
  }

  console.log(`[ImportSummaries] Found ${jsonFiles.length} file(s) to import`);

  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const updatedIds: string[] = [];

  try {
    for (const filePath of jsonFiles) {
      const fileName = path.basename(filePath);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const items: BillSummaryData[] = JSON.parse(raw);

      console.log(`[ImportSummaries] Processing ${fileName} (${items.length} items)`);

      for (const item of items) {
        if (!item.id || !item.simpleSummary) {
          totalSkipped++;
          continue;
        }

        try {
          await prisma.bill.update({
            where: { id: item.id },
            data: {
              simpleSummary: item.simpleSummary,
              structuredSummary:
                typeof item.structuredSummary === 'string'
                  ? JSON.parse(item.structuredSummary)
                  : item.structuredSummary,
              topic: item.topic,
            },
          });
          totalUpdated++;
          updatedIds.push(item.id);
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            // 존재하지 않는 bill ID는 무시
            totalErrors++;
          } else {
            console.error(`[ImportSummaries] Unexpected error for ${item.id}:`, err);
            throw err;
          }
        }
      }

      console.log(`[ImportSummaries] ${fileName} done`);
    }

    console.log(
      `[ImportSummaries] Complete. Updated: ${totalUpdated}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`,
    );

    // 업데이트된 bill의 개별 캐시 무효화
    if (updatedIds.length > 0) {
      const redis = createRedis();
      if (redis) {
        const keys = updatedIds.map((id) => `bill:${id}`);
        // Upstash del은 한 번에 여러 키 삭제 가능하지만, 너무 많으면 배치로 처리
        const BATCH = 100;
        for (let i = 0; i < keys.length; i += BATCH) {
          await redis.del(...keys.slice(i, i + BATCH));
        }
        console.log(`[ImportSummaries] Invalidated ${keys.length} cache keys`);
      } else {
        console.log('[ImportSummaries] Redis not configured — cache invalidation skipped');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
