import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';
import { getPartyId, getPartyColor } from '../constants/party-map';
import { parseElectedCount } from '../constants/elected-count-map';

/** 현직 국회의원 인적사항 API 응답 row */
interface MemberApiRow {
  MONA_CD: string;
  HG_NM: string;
  HJ_NM: string;
  ENG_NM: string;
  BTH_DATE: string;
  POLY_NM: string;
  ORIG_NM: string;
  ELECT_GBN_NM: string;
  CMITS: string;
  REELE_GBN_NM: string;
  UNITS: string;
  SEX_GBN_NM: string;
  E_MAIL: string;
  TEL_NO: string;
  ASSEM_ADDR: string;
  MEM_TITLE: string;
  JOB_RES_NM: string;
}

/** 역대 국회의원 인적사항 API 응답 row */
interface HistoricalMemberApiRow {
  MONA_CD: string;
  HG_NM: string;
  HJ_NM: string;
  ENG_NM: string;
  BTH_DATE: string;
  SEX_GBN_NM: string;
  REELE_GBN_NM: string;
  UNITS: string;
  UNIT_CD: string;
  UNIT_NM: string;
  POLY_NM: string;
  ORIG_NM: string;
  ELECT_GBN_NM: string;
}

/** 현재 국회 대수 — 현직 API는 이 대수에만 사용 */
const CURRENT_TERM = 22;

export class MemberSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api: AssemblyApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncMembers(termId: number): Promise<void> {
    const log = await this.syncLog.start('members', termId);

    try {
      let rows: MemberApiRow[];

      if (termId === CURRENT_TERM) {
        // 현직 API: 현재 대수만 지원
        rows = await this.api.fetchAll<MemberApiRow>('nwvrqwxyaytdsfvhu', {});
      } else {
        // 역대 API: UNIT_CD = 100000 + 대수
        const historicalRows = await this.api.fetchAll<HistoricalMemberApiRow>(
          'npffdutiapkzbfyvr',
          { UNIT_CD: String(100000 + termId) },
        );
        // 역대 API 응답을 MemberApiRow 형태로 변환 (없는 필드는 빈 값)
        rows = historicalRows.map((r) => ({
          ...r,
          BTH_GBN_NM: '',
          CMITS: '',
          E_MAIL: '',
          TEL_NO: '',
          ASSEM_ADDR: '',
          MEM_TITLE: '',
          JOB_RES_NM: '',
        }));
      }

      console.log(`[MemberSync] Fetched ${rows.length} member records for term ${termId}`);

      await this.ensurePartiesExist(rows);

      let count = 0;
      for (const row of rows) {
        await this.upsertMember(row, termId);
        count++;
        if (count % 50 === 0) {
          console.log(`[MemberSync]   Processed ${count}/${rows.length} members`);
        }
      }

      // API가 현재 시점 기준 누적 선수를 반환하므로, 과거 대수의 선수를 보정
      await this.fixElectedCounts();

      await this.syncLog.complete(log.id, count);
      console.log(`[MemberSync] Completed: ${count} records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[MemberSync] Failed: ${msg}`);
      throw error;
    }
  }

  private async ensurePartiesExist(rows: MemberApiRow[]): Promise<void> {
    const uniquePartyNames = [...new Set(rows.map((r) => r.POLY_NM))];

    for (const partyName of uniquePartyNames) {
      const partyId = getPartyId(partyName);
      const existing = await this.prisma.party.findUnique({ where: { id: partyId } });

      if (!existing) {
        const color = getPartyColor(partyId);
        console.warn(
          `[MemberSync] Unknown party "${partyName}" → auto-creating "${partyId}" (${color})`,
        );
        await this.prisma.party.create({
          data: { id: partyId, name: partyName, shortName: partyName, color },
        });
      }
    }
  }

  private async upsertMember(row: MemberApiRow, termId: number): Promise<void> {
    const memberId = row.MONA_CD;
    const birthDate = this.parseBirthDate(row.BTH_DATE);
    const electedCount = parseElectedCount(row.REELE_GBN_NM);
    const partyId = getPartyId(row.POLY_NM);
    const proportional = row.ELECT_GBN_NM === '비례대표';
    const district = proportional ? '' : (row.ORIG_NM ?? '');
    const committees = row.CMITS
      ? row.CMITS.split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : [];
    const committeeRole = row.JOB_RES_NM || '위원';
    const career = row.MEM_TITLE?.trim() || null;

    // 역대 API에는 MEM_TITLE이 없으므로, career가 null이면 기존 값 보존
    const memberUpdate: Record<string, unknown> = { name: row.HG_NM, birthDate, electedCount };
    if (career) memberUpdate.career = career;

    await this.prisma.member.upsert({
      where: { id: memberId },
      update: memberUpdate,
      create: { id: memberId, name: row.HG_NM, photoUrl: '', birthDate, electedCount, career },
    });

    // 역대 API에는 CMITS, JOB_RES_NM이 없으므로, 빈 값이면 기존 값 보존
    const termUpdate: Record<string, unknown> = { partyId, district, proportional, electedCount };
    if (committees.length > 0) termUpdate.committees = committees;
    if (row.JOB_RES_NM) termUpdate.committeeRole = committeeRole;

    await this.prisma.memberTerm.upsert({
      where: { memberId_termId: { memberId, termId } },
      update: termUpdate,
      create: {
        memberId,
        termId,
        partyId,
        district,
        proportional,
        committees,
        committeeRole,
        electedCount,
      },
    });
  }

  /**
   * 역대 API의 REELE_GBN_NM은 현재 시점 기준 누적 선수를 반환하므로,
   * 최신 대수의 API 값을 기준으로 과거 대수의 선수를 역산한다.
   *
   * 방식: 의원별로 MemberTerm을 대수 역순 정렬 후 순위를 매기고,
   *       최신 대수의 electedCount에서 (순위 - 1)을 빼서 계산.
   * 예: 김기현 — DB에 21대, 22대 / 22대 API값 = 5선
   *   → 22대: rank=1 → 5-(1-1) = 5선
   *   → 21대: rank=2 → 5-(2-1) = 4선
   * 비연속 당선에도 정확 (16대→18대→21대 등 DB에 없는 대수는 건너뜀).
   */
  private async fixElectedCounts(): Promise<void> {
    const result = await this.prisma.$executeRaw`
      WITH ranked AS (
        SELECT id,
               "memberId",
               ROW_NUMBER() OVER (PARTITION BY "memberId" ORDER BY "termId" DESC) AS rn
        FROM "MemberTerm"
      ),
      latest AS (
        SELECT r.id, r."memberId", mt."electedCount" AS latest_ec, r.rn
        FROM ranked r
        JOIN "MemberTerm" mt ON mt.id = r.id
        WHERE r.rn = 1
      )
      UPDATE "MemberTerm" mt
      SET "electedCount" = GREATEST(1, l.latest_ec - (r.rn - 1))
      FROM ranked r
      JOIN latest l ON l."memberId" = r."memberId"
      WHERE mt.id = r.id
        AND r.rn > 1
        AND mt."electedCount" != GREATEST(1, l.latest_ec - (r.rn - 1))
    `;
    if (result > 0) {
      console.log(`[MemberSync] Fixed electedCount for ${result} past-term records`);
    }
  }

  private parseBirthDate(raw: string | null): string | null {
    if (!raw) return null;
    const cleaned = raw.replace(/[^0-9]/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    return raw;
  }
}
