import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * NEC 재산신고서 OCR 결과 → CandidateAssetItem 적재
 *
 * 사용법:
 *   pnpm tsx backend/src/sync/scripts/import-ocr-assets.ts <ocr-result.json>
 *
 * 입력 JSON 형식:
 * {
 *   "candidates": [
 *     {
 *       "table": "localElectionCandidate" | "candidate",
 *       "id": 8466,
 *       "name": "김태흠",
 *       "sourceDate": "2026-05-14",   // 재산신고일 (PDF 작성일)
 *       "sourceUrl": "https://info.nec.go.kr/...",  // 원본 PDF URL (페이지1)
 *       "items": [
 *         {
 *           "category": "토지",
 *           "subCategory": "전",
 *           "relation": "본인",
 *           "description": "충청남도 보령시 웅천읍 수부리 089-3번지 1,732.00㎡",
 *           "currentValue": 25807000,  // 원 단위 (천원 × 1000)
 *           "marketPrice": null,
 *           "changeReason": null
 *         },
 *         ...
 *       ]
 *     }
 *   ]
 * }
 *
 * source = 'nec_ocr_vision'로 적재. 동일 source+sourceDate+candidate 기존 데이터는 사전 deleteMany.
 */

interface OcrItem {
  category: string;
  subCategory?: string | null;
  relation: string;
  description: string;
  currentValue?: number | null;
  previousValue?: number | null;
  increaseValue?: number | null;
  decreaseValue?: number | null;
  marketPrice?: number | null;
  changeReason?: string | null;
}

interface OcrCandidate {
  table: 'localElectionCandidate' | 'candidate';
  id: number;
  name: string;
  sourceDate?: string | null;
  sourceUrl?: string | null;
  items: OcrItem[];
}

interface OcrResult {
  candidates: OcrCandidate[];
}

function toBigIntOrNull(value: number | null | undefined): bigint | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  return BigInt(Math.trunc(value));
}

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
  const data = JSON.parse(raw) as OcrResult;
  if (!data.candidates || !Array.isArray(data.candidates)) {
    console.error('Invalid JSON: missing "candidates" array');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    let totalInserted = 0;
    let totalDeleted = 0;

    for (const cand of data.candidates) {
      if (!cand.id || !cand.table || !Array.isArray(cand.items)) {
        console.warn(`Skip invalid candidate entry: ${JSON.stringify(cand).slice(0, 100)}`);
        continue;
      }

      const where: Record<string, unknown> = {
        source: 'nec_ocr_vision',
        ...(cand.sourceDate ? { sourceDate: cand.sourceDate } : {}),
      };
      if (cand.table === 'localElectionCandidate') {
        where.localCandidateId = cand.id;
      } else {
        where.byCandidateId = cand.id;
      }
      const deleted = await prisma.candidateAssetItem.deleteMany({ where });
      totalDeleted += deleted.count;

      for (const item of cand.items) {
        if (!item.category || !item.relation || !item.description) {
          console.warn(
            `  Skip invalid item for ${cand.name}: ${JSON.stringify(item).slice(0, 80)}`,
          );
          continue;
        }
        await prisma.candidateAssetItem.create({
          data: {
            localCandidateId: cand.table === 'localElectionCandidate' ? cand.id : null,
            byCandidateId: cand.table === 'candidate' ? cand.id : null,
            category: item.category,
            subCategory: item.subCategory ?? null,
            relation: item.relation,
            description: item.description,
            currentValue: toBigIntOrNull(item.currentValue ?? null),
            previousValue: toBigIntOrNull(item.previousValue ?? null),
            increaseValue: toBigIntOrNull(item.increaseValue ?? null),
            decreaseValue: toBigIntOrNull(item.decreaseValue ?? null),
            marketPrice: toBigIntOrNull(item.marketPrice ?? null),
            changeReason: item.changeReason ?? null,
            source: 'nec_ocr_vision',
            sourceUrl: cand.sourceUrl ?? null,
            sourceDate: cand.sourceDate ?? null,
            rawJson: item as object,
          },
        });
        totalInserted++;
      }
      console.log(
        `${cand.name} (${cand.table}/${cand.id}): ${cand.items.length} items (deleted ${deleted.count})`,
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
