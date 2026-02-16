import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { SyncLogService } from './sync-log.service';

/**
 * 뉴스타파 공직자 재산 CSV (records) 컬럼:
 * 순번, 연도, 관할기관, 성명(또는 이름), 소속, 직위,
 * 본인과의 관계, 재산 대분류, 재산의 종류,
 * 소재지 면적 등 권리의 명세, 종전가액, 증가액, 증가실거래액,
 * 감소액, 감소실거래액, 현재가액, 현재가실거래액, 변동사유
 */
interface CsvRow {
  [key: string]: string;
}

export class AssetSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncAssets(): Promise<void> {
    const log = await this.syncLog.start('assets');

    try {
      const dataDir = path.resolve(__dirname, '../../../data/assets');
      if (!fs.existsSync(dataDir)) {
        console.log(`[AssetSync] No data directory: ${dataDir}`);
        await this.syncLog.complete(log.id, 0);
        return;
      }

      const files = fs
        .readdirSync(dataDir)
        .filter((f) => f.endsWith('.csv') && f.startsWith('assets_'));

      if (files.length === 0) {
        console.log('[AssetSync] No CSV files found');
        await this.syncLog.complete(log.id, 0);
        return;
      }

      // 의원 이름 → ID 매핑
      const allMembers = await this.prisma.member.findMany({
        select: { id: true, name: true, birthDate: true },
      });
      const nameMap = new Map<string, { id: string; birthDate: string | null }[]>();
      for (const m of allMembers) {
        const list = nameMap.get(m.name) ?? [];
        list.push({ id: m.id, birthDate: m.birthDate });
        nameMap.set(m.name, list);
      }

      console.log(`[AssetSync] Loaded ${allMembers.length} members for name matching`);

      let totalCount = 0;

      for (const file of files) {
        const yearMatch = file.match(/assets_(\d{4})/);
        if (!yearMatch) continue;
        const year = parseInt(yearMatch[1], 10);

        console.log(`[AssetSync] Processing ${file} (year=${year})`);

        const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
        const rows: CsvRow[] = parse(content, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
          relax_column_count: true,
          relax_quotes: true,
        });

        // 국회공직자윤리위원회 소속 + 국회의원 직위만 필터
        const assemblyRows = rows.filter(
          (r) =>
            (r['관할기관'] ?? '').includes('국회공직자윤리위원회') &&
            (r['직위'] ?? '').includes('국회의원'),
        );

        console.log(
          `[AssetSync]   Total rows: ${rows.length}, National Assembly member rows: ${assemblyRows.length}`,
        );

        let fileCount = 0;
        const unmatchedNames = new Set<string>();

        for (const row of assemblyRows) {
          // 컬럼명이 연도별로 다름: "성명" (2024) vs "이름" (2023)
          const name = (row['성명'] ?? row['이름'] ?? '').trim();
          if (!name) continue;

          const candidates = nameMap.get(name);
          if (!candidates || candidates.length === 0) {
            unmatchedNames.add(name);
            continue;
          }

          // 동명이인이 2명 이상이면 정확한 매핑 불가 → 스킵
          if (candidates.length > 1) {
            unmatchedNames.add(`${name}(동명이인 ${candidates.length}명)`);
            continue;
          }

          const memberId = candidates[0].id;

          const category = (row['재산 대분류'] ?? '').trim() || '기타';
          const subType = (row['재산의 종류'] ?? '').trim();
          const detail = (row['소재지 면적 등 권리의 명세'] ?? '').trim();
          const item = subType ? (detail ? `${subType} - ${detail}` : subType) : detail || '';

          // 현재가액 사용 (천원 단위)
          const amountStr = (row['현재가액'] ?? '0').replace(/,/g, '').trim();
          const amount = BigInt(Math.round(parseFloat(amountStr) || 0));

          const relation = (row['본인과의 관계'] ?? '').trim() || '본인';

          // item이 매우 길 수 있으므로 200자로 제한 (unique 제약)
          const truncatedItem = item.length > 200 ? item.slice(0, 200) : item;

          await this.prisma.asset.upsert({
            where: {
              memberId_year_category_item_relation: {
                memberId,
                year,
                category,
                item: truncatedItem,
                relation,
              },
            },
            update: { amount },
            create: { memberId, year, category, item: truncatedItem, amount, relation },
          });

          fileCount++;
          if (fileCount % 500 === 0) {
            console.log(`[AssetSync]   Processed ${fileCount} records...`);
          }
        }

        if (unmatchedNames.size > 0) {
          console.log(
            `[AssetSync]   Unmatched names (${unmatchedNames.size}): ${[...unmatchedNames].slice(0, 10).join(', ')}`,
          );
        }

        console.log(`[AssetSync]   Imported ${fileCount} records from ${file}`);
        totalCount += fileCount;
      }

      await this.syncLog.complete(log.id, totalCount);
      console.log(`[AssetSync] Completed: ${totalCount} total records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[AssetSync] Failed: ${msg}`);
      throw error;
    }
  }
}
