import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

/**
 * 격전지 후보 PDF를 고해상도(250 DPI) PNG로 임시 변환 → OCR 입력용
 *
 * 사용법:
 *   pnpm tsx backend/src/sync/scripts/export-asset-pdf-for-ocr.ts <table> --ids 1,2,3 [--dpi 250] [--out /tmp/ocr-input]
 *
 * table:
 *   local       지방선거 후보 (LocalElectionCandidate)
 *   by          재보궐 후보 (Candidate)
 *
 * 출력 구조:
 *   <out>/<table>/<id>/page-1.png, page-2.png, ...
 *   <out>/manifest.json   { items: [{ table, id, name, huboid, pages: [{ num, png, sourcePdf }] }] }
 *
 * 표지(1쪽)도 함께 변환 — 카테고리 체크박스 확인용. 실제 항목별 명세는 2쪽부터.
 */

const execFileP = promisify(execFile);
const HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

interface CandidateInfo {
  table: 'localElectionCandidate' | 'candidate';
  id: number;
  name: string;
  huboid: string | null;
  assetPdfUrls: string[];
}

interface ManifestPage {
  num: number;
  png: string;
  sourcePdf: string;
}

interface ManifestItem extends Omit<CandidateInfo, 'assetPdfUrls'> {
  pages: ManifestPage[];
}

async function main() {
  const table = process.argv[2] as 'local' | 'by' | undefined;
  if (table !== 'local' && table !== 'by') {
    console.error('Usage: pnpm tsx ... <local|by> --ids 1,2,3 [--dpi 250] [--out /tmp/ocr-input]');
    process.exit(1);
  }

  const args = process.argv.slice(3);
  const idsArg = getArg(args, '--ids');
  const dpi = parseInt(getArg(args, '--dpi') ?? '250', 10);
  const outDir = path.resolve(getArg(args, '--out') ?? '/tmp/ocr-input');

  if (!idsArg) {
    console.error('--ids required');
    process.exit(1);
  }
  const ids = idsArg.split(',').map((s) => parseInt(s.trim(), 10));
  if (ids.some((n) => !Number.isFinite(n))) {
    console.error('Invalid --ids');
    process.exit(1);
  }

  const tableKey: CandidateInfo['table'] =
    table === 'local' ? 'localElectionCandidate' : 'candidate';

  const prisma = new PrismaClient();
  await prisma.$connect();

  fs.mkdirSync(outDir, { recursive: true });

  const items: ManifestItem[] = [];

  try {
    const select = { id: true, name: true, huboid: true, assetPdfUrls: true };
    const where = { id: { in: ids } };
    const rows =
      tableKey === 'localElectionCandidate'
        ? await prisma.localElectionCandidate.findMany({ where, select })
        : await prisma.candidate.findMany({ where, select });
    const candidates: CandidateInfo[] = rows.map((c) => ({
      table: tableKey,
      id: c.id,
      name: c.name,
      huboid: c.huboid ?? null,
      assetPdfUrls: c.assetPdfUrls,
    }));

    console.log(`Found ${candidates.length} candidates`);

    for (const c of candidates) {
      console.log(`\n=== ${c.name} (id=${c.id}, ${c.assetPdfUrls.length} pages) ===`);
      const candidateDir = path.join(outDir, tableKey, String(c.id));
      fs.mkdirSync(candidateDir, { recursive: true });

      const pages: ManifestPage[] = [];

      for (let i = 0; i < c.assetPdfUrls.length; i++) {
        const pdfUrl = c.assetPdfUrls[i];
        const pageNum = i + 1;

        // 1) PDF 다운로드
        const pdfPath = path.join(candidateDir, `page-${pageNum}.pdf`);
        const res = await fetch(pdfUrl, { headers: HTTP_HEADERS });
        if (!res.ok) {
          console.warn(`  page${pageNum}: HTTP ${res.status} skip`);
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(pdfPath, buf);

        // 2) 고해상도 PNG 변환
        const pngBase = path.join(candidateDir, `page-${pageNum}`);
        await execFileP('pdftoppm', ['-png', '-r', String(dpi), '-singlefile', pdfPath, pngBase], {
          timeout: 60_000,
        });
        const pngPath = `${pngBase}.png`;
        if (!fs.existsSync(pngPath)) {
          console.warn(`  page${pageNum}: pdftoppm output missing`);
          continue;
        }
        pages.push({ num: pageNum, png: pngPath, sourcePdf: pdfUrl });

        // 임시 PDF는 삭제
        fs.unlinkSync(pdfPath);
        console.log(`  page${pageNum} ✓ (${fs.statSync(pngPath).size} bytes)`);
      }

      items.push({
        table: c.table,
        id: c.id,
        name: c.name,
        huboid: c.huboid,
        pages,
      });
    }

    const manifestPath = path.join(outDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify({ items }, null, 2));
    console.log(`\nManifest: ${manifestPath}`);
    console.log(
      `Total: ${items.length} candidates, ${items.reduce((s, i) => s + i.pages.length, 0)} pages`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

function getArg(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  if (i < 0 || i + 1 >= args.length) return undefined;
  return args[i + 1];
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
