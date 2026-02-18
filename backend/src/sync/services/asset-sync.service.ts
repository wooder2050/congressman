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

      // 의원 이름 → ID 매핑 (지역구 + 임기 포함하여 동명이인 해소)
      const allMembers = await this.prisma.member.findMany({
        select: { id: true, name: true, birthDate: true },
      });
      const memberTerms = await this.prisma.memberTerm.findMany({
        select: { memberId: true, termId: true, district: true },
      });
      const termInfoMap = new Map<string, { termIds: number[]; districts: string[] }>();
      for (const mt of memberTerms) {
        const info = termInfoMap.get(mt.memberId) ?? { termIds: [], districts: [] };
        info.termIds.push(mt.termId);
        if (mt.district) info.districts.push(mt.district);
        termInfoMap.set(mt.memberId, info);
      }
      const nameMap = new Map<
        string,
        { id: string; birthDate: string | null; districts: string[]; termIds: number[] }[]
      >();
      for (const m of allMembers) {
        const list = nameMap.get(m.name) ?? [];
        const info = termInfoMap.get(m.id) ?? { termIds: [], districts: [] };
        list.push({ id: m.id, birthDate: m.birthDate, ...info });
        nameMap.set(m.name, list);
      }

      console.log(`[AssetSync] Loaded ${allMembers.length} members for name matching`);

      let totalCount = 0;

      for (const file of files) {
        const yearMatch = file.match(/assets_(\d{4})/);
        if (!yearMatch) continue;
        const year = parseInt(yearMatch[1], 10);

        // 파일명에서 대수 힌트 추출: assets_2024_22nd.csv → 22
        const termHintMatch = file.match(/(\d{1,2})(?:st|nd|rd|th)/);
        // 대수 힌트가 없으면 연도로 추정
        // 재산 공개는 3월이므로 해당 연도 파일은 직전 대수 임기 중 공개분
        const fileTerm = termHintMatch
          ? parseInt(termHintMatch[1], 10)
          : year <= 2020
            ? 20
            : year <= 2024
              ? 21
              : 22;

        console.log(`[AssetSync] Processing ${file} (year=${year}, term=${fileTerm ?? 'unknown'})`);

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
          const rawName = (row['성명'] ?? row['이름'] ?? '').trim();
          if (!rawName) continue;

          // 이름에 괄호가 있으면 지역구 힌트 추출: "김병욱(경기성남시분당구을)"
          const nameParenMatch = rawName.match(/^(.+?)\((.+)\)$/);
          const name = nameParenMatch ? nameParenMatch[1] : rawName;
          // 직위에도 지역구 힌트가 있을 수 있음: "국회의원(경기 성남시분당구을)"
          const positionRaw = (row['직위'] ?? '').match(/\((.+)\)/)?.[1] ?? '';
          // "신규등록" 등 지역구가 아닌 힌트 무시
          const nonDistrictHints = ['신규등록', '비례대표'];
          const positionHint = nonDistrictHints.includes(positionRaw) ? '' : positionRaw;
          const districtHint = nameParenMatch?.[2] ?? positionHint;

          const candidates = nameMap.get(name);
          if (!candidates || candidates.length === 0) {
            unmatchedNames.add(name);
            continue;
          }

          let memberId: string;
          if (candidates.length === 1) {
            memberId = candidates[0].id;
          } else if (districtHint) {
            // 동명이인: 지역구 힌트로 매칭 (공백/특수문자 제거 후 부분 매칭)
            const hint = districtHint.replace(/\s+/g, '');
            const matched = candidates.find((c) =>
              c.districts.some((d) => {
                const norm = d.replace(/\s+/g, '');
                return norm.includes(hint) || hint.includes(norm);
              }),
            );
            if (!matched) {
              unmatchedNames.add(`${name}(지역구 불일치: ${districtHint})`);
              continue;
            }
            memberId = matched.id;
          } else if (fileTerm) {
            // 동명이인: 임기(대수)로 매칭
            const matched = candidates.find((c) => c.termIds.includes(fileTerm));
            if (!matched) {
              unmatchedNames.add(
                `${name}(동명이인 ${candidates.length}명, term=${fileTerm} 불일치)`,
              );
              continue;
            }
            memberId = matched.id;
          } else {
            unmatchedNames.add(`${name}(동명이인 ${candidates.length}명)`);
            continue;
          }

          const category = (row['재산 대분류'] ?? '').trim() || '기타';
          const subType = (row['재산의 종류'] ?? '').trim();
          const detail = (row['소재지 면적 등 권리의 명세'] ?? '').trim();
          const item = subType ? (detail ? `${subType} - ${detail}` : subType) : detail || '';

          // 현재가액 사용 (천원 단위)
          const amountStr = (row['현재가액'] ?? '0').replace(/,/g, '').trim();
          let amount = BigInt(Math.round(parseFloat(amountStr) || 0));
          // 채무는 항상 음수로 저장 (CSV 연도별로 부호가 다를 수 있음)
          if (category === '채무' && amount > 0n) amount = -amount;

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
