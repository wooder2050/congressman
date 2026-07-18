import { PrismaClient } from '@prisma/client';
import { AssemblyApiService } from './assembly-api.service';
import { SyncLogService } from './sync-log.service';
import { getPartyId, getPartyColor } from '../constants/party-map';
import { parseElectedCount } from '../constants/elected-count-map';
import { CABINET_MEMBERS, parseCabinetFromCareer } from '../constants/cabinet-members';

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

/** 대수별 개원일 — 신규 MemberTerm의 startDate 기본값 */
const TERM_OPENING_DATE: Record<number, string> = { 22: '2024-05-30' };

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

      // 현직 API 응답에서 사라진 의원(사퇴·승계 등)은 비활성 처리
      if (termId === CURRENT_TERM) {
        await this.deactivateDepartedMembers(termId, rows);
        // 국무위원 겸직 명단과 API 약력을 대조해 새 겸직/복귀 감지 → 로그로 알림
        this.detectCabinetDrift(rows);
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

  /**
   * 현직 API 응답에 없는 의원을 isActive=false로 표시한다.
   * 정원(300)에 크게 못 미치는 응답은 API 장애일 수 있으므로 건너뛴다.
   */
  private async deactivateDepartedMembers(termId: number, rows: MemberApiRow[]): Promise<void> {
    if (rows.length < 250) {
      console.warn(
        `[MemberSync] Only ${rows.length} members in API response — skipping deactivation (possible API issue)`,
      );
      return;
    }

    const activeIds = rows.map((r) => r.MONA_CD);
    const deactivated = await this.prisma.memberTerm.updateMany({
      where: { termId, isActive: true, memberId: { notIn: activeIds } },
      data: { isActive: false },
    });
    if (deactivated.count > 0) {
      console.log(`[MemberSync] Deactivated ${deactivated.count} departed members`);
    }
  }

  /**
   * 국무위원 겸직 명단(CABINET_MEMBERS)과 국회 API 약력(MEM_TITLE)을 대조해
   * 명단 이탈(drift)을 감지하고 경고 로그를 남긴다. 자동 수정은 하지 않는다
   * (오탐 방지 — API 반영이 늦은 장관 겸직이 많아 사람이 확인 후 명단을 갱신).
   *
   * - API 약력엔 겸직으로 나오는데 명단에 없음 → 새 입각(추가 필요)
   * - 명단엔 있는데 API 약력에서 겸직이 사라짐 → 복귀 가능성(제거 검토)
   */
  private detectCabinetDrift(rows: MemberApiRow[]): void {
    const apiCabinet = new Map<string, string>();
    for (const r of rows) {
      const pos = parseCabinetFromCareer(r.MEM_TITLE);
      if (pos) apiCabinet.set(r.MONA_CD, pos);
    }

    // 새 입각: API 약력엔 겸직인데 명단에 없음
    for (const [id, pos] of apiCabinet) {
      if (!(id in CABINET_MEMBERS)) {
        const name = rows.find((r) => r.MONA_CD === id)?.HG_NM ?? id;
        console.warn(
          `[MemberSync] ⚠️ 겸직 명단 누락 의심: ${name}(${id}) 약력에 "${pos}" — cabinet-members.ts에 추가 검토`,
        );
      }
    }

    // 복귀 가능성: 명단엔 있는데 API 약력에서 겸직이 사라짐
    const activeIds = new Set(rows.map((r) => r.MONA_CD));
    for (const id of Object.keys(CABINET_MEMBERS)) {
      if (activeIds.has(id) && !apiCabinet.has(id)) {
        const name = rows.find((r) => r.MONA_CD === id)?.HG_NM ?? id;
        console.warn(
          `[MemberSync] ⚠️ 겸직 복귀 가능성: ${name}(${id}) 약력에서 겸직 표기 사라짐 — cabinet-members.ts에서 제거 검토(단, 장관 겸직은 API 반영이 늦을 수 있음)`,
        );
      }
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
    const apiRole = row.JOB_RES_NM || '';
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
    // isActive: API 응답에 있는 의원은 현직 (사퇴 후 재등원 시 재활성화)
    // 국무위원 겸직: 명단(source of truth) 기준으로 설정. 겸직에서 빠지면 null로 복원돼
    // 평가 지표에 자동 재편입된다. 겸직은 현직(현재 대수)에만 유효하므로 과거 대수엔 적용하지
    // 않는다(과거 재직 기록이 현재 겸직으로 오염되는 것 방지).
    const cabinetPosition = termId === CURRENT_TERM ? (CABINET_MEMBERS[memberId] ?? null) : null;

    const termUpdate: Record<string, unknown> = {
      partyId,
      district,
      proportional,
      electedCount,
      isActive: true,
      cabinetPosition,
    };
    if (committees.length > 0) {
      termUpdate.committees = committees;

      // 기존 DB의 committeeRoles를 읽어서 병합 (수동 설정된 위원장/간사를 보존)
      const existing = await this.prisma.memberTerm.findUnique({
        where: { memberId_termId: { memberId, termId } },
        select: { committeeRoles: true },
      });
      const existingRoles = (existing?.committeeRoles ?? {}) as Record<string, string>;

      // 새 위원회 목록 기준으로 역할 맵 생성
      const committeeRoles: Record<string, string> = {};
      for (const c of committees) {
        // 기존 DB에 위원장/간사가 설정되어 있으면 보존, 없으면 기본값 '위원'
        committeeRoles[c] = existingRoles[c] ?? '위원';
      }

      // API의 JOB_RES_NM이 위원장/간사인데 기존 DB에 해당 역할이 없으면,
      // 소속 위원회가 1개일 때만 안전하게 적용
      if (apiRole && apiRole !== '위원') {
        const hasRoleInDb = Object.values(committeeRoles).some((r) => r === apiRole);
        if (!hasRoleInDb && committees.length === 1) {
          committeeRoles[committees[0]] = apiRole;
        }
      }

      termUpdate.committeeRoles = committeeRoles;
    }

    // 신규 MemberTerm(임기 중 합류 = 재보궐·승계 가능성)이면 경고 로그를 남긴다.
    // 개원 초기 일괄 생성이 아니라 이후 새로 등장한 의원은 startDate를 실제 취임일로
    // 교정할 필요가 있어 알린다(평가 재직기간 정확도). update에는 startDate를 넣지 않아
    // backfill/교정한 정확한 날짜를 보존한다.
    const existing = await this.prisma.memberTerm.findUnique({
      where: { memberId_termId: { memberId, termId } },
      select: { id: true },
    });
    if (!existing && termId === CURRENT_TERM) {
      console.warn(
        `[MemberSync] ⚠️ 신규 의원 등장: ${row.HG_NM}(${memberId}) — 재보궐·승계면 startDate를 실제 취임일로 교정 필요(기본값=개원일)`,
      );
    }

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
        committeeRoles: termUpdate.committeeRoles ?? {},
        electedCount,
        cabinetPosition,
        startDate: TERM_OPENING_DATE[termId] ?? null,
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
