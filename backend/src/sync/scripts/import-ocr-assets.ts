import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

import { RawInput, validateInput, ValidationError } from './ocr-validator';

/**
 * NEC 재산신고서 OCR 결과 → CandidateAssetItem 적재
 *
 * 사용법:
 *   pnpm tsx backend/src/sync/scripts/import-ocr-assets.ts <ocr-result.json>
 *
 * 입력 JSON 형식 / 검증 규칙: ocr-validator.ts 참조
 *
 * Idempotency (codex PR #377 #3):
 *   - 같은 (candidate, source) 조합의 모든 기존 행을 sourceDate와 무관하게 삭제 후 재삽입
 */

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: pnpm tsx ... <ocr-result.json>');
    process.exit(1);
  }
  const resolvedPath = path.resolve(jsonPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');
  let parsed: RawInput;
  try {
    parsed = JSON.parse(raw) as RawInput;
  } catch (e) {
    console.error(`JSON parse failed: ${(e as Error).message}`);
    process.exit(1);
  }

  let candidates;
  try {
    candidates = validateInput(parsed);
  } catch (e) {
    if (e instanceof ValidationError) {
      console.error(`✗ Validation failed: ${e.message}`);
    } else {
      console.error(`✗ Unexpected: ${(e as Error).message}`);
    }
    process.exit(1);
  }
  console.log(
    `✓ Validated ${candidates.length} candidates, ${candidates.reduce((s, c) => s + c.items.length, 0)} items`,
  );

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    let totalInserted = 0;
    let totalDeleted = 0;

    for (const cand of candidates) {
      // Idempotency 강화: 같은 (candidate, source) 모든 기존 행 삭제
      const deleteWhere: Record<string, unknown> = { source: 'nec_ocr_vision' };
      if (cand.table === 'localElectionCandidate') {
        deleteWhere.localCandidateId = cand.id;
      } else {
        deleteWhere.byCandidateId = cand.id;
      }
      const deleted = await prisma.candidateAssetItem.deleteMany({ where: deleteWhere });
      totalDeleted += deleted.count;

      for (const item of cand.items) {
        await prisma.candidateAssetItem.create({
          data: {
            localCandidateId: cand.table === 'localElectionCandidate' ? cand.id : null,
            byCandidateId: cand.table === 'candidate' ? cand.id : null,
            category: item.category,
            subCategory: item.subCategory,
            relation: item.relation,
            description: item.description,
            currentValue: item.currentValue,
            previousValue: item.previousValue,
            increaseValue: item.increaseValue,
            decreaseValue: item.decreaseValue,
            marketPrice: item.marketPrice,
            changeReason: item.changeReason,
            source: 'nec_ocr_vision',
            sourceUrl: cand.sourceUrl,
            sourceDate: cand.sourceDate,
            rawJson: item as object,
          },
        });
        totalInserted++;
      }
      console.log(
        `${cand.name} (${cand.table}/${cand.id}): ${cand.items.length} items (deleted ${deleted.count} prior)`,
      );
    }

    console.log(`\nTotal inserted: ${totalInserted}, deleted (prior): ${totalDeleted}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
