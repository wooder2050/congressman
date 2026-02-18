import { type Prisma, PrismaClient } from '@prisma/client';
import { SyncLogService } from './sync-log.service';

interface CommitteeEntry {
  name: string;
  startDate: string; // "2020.07.06"
  endDate: string | null; // "2022.05.29" 또는 null(현재 소속)
}

/**
 * 국회 웹사이트에서 위원회 경력 정보를 크롤링하여
 * MemberTerm.committees + committeeHistory를 업데이트하는 서비스.
 *
 * URL: https://www.assembly.go.kr/portal/assm/assmMemb/memberProfile.do
 *      ?monaCd={MONA_CD}&st={termId}&viewType=CONTBODY&tabId=P13
 */
export class CommitteeSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {}

  async syncCommittees(termId: number): Promise<void> {
    const log = await this.syncLog.start('committees', termId);

    try {
      // committeeHistory가 비어있는 의원 대상 (전체 이력 기준)
      const memberTerms = await this.prisma.memberTerm.findMany({
        where: {
          termId,
          committeeHistory: { equals: [] },
        },
        select: { memberId: true },
      });

      console.log(
        `[CommitteeSync] Found ${memberTerms.length} members without committeeHistory for term ${termId}`,
      );

      if (memberTerms.length === 0) {
        await this.syncLog.complete(log.id, 0);
        console.log('[CommitteeSync] Nothing to sync');
        return;
      }

      let updated = 0;
      let skipped = 0;

      for (let i = 0; i < memberTerms.length; i++) {
        const { memberId } = memberTerms[i];

        try {
          const history = await this.fetchCommitteeHistory(memberId, termId);

          if (history.length > 0) {
            // 마지막 소속 위원회 계산
            const committees = this.extractLatestCommittees(history);

            await this.prisma.memberTerm.update({
              where: { memberId_termId: { memberId, termId } },
              data: { committees, committeeHistory: history as unknown as Prisma.InputJsonValue },
            });
            updated++;
          } else {
            skipped++;
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          console.warn(`[CommitteeSync] Failed for ${memberId}: ${msg}`);
          skipped++;
        }

        if ((i + 1) % 50 === 0) {
          console.log(
            `[CommitteeSync] Progress: ${i + 1}/${memberTerms.length} (updated: ${updated}, skipped: ${skipped})`,
          );
        }

        // 서버 부담 방지: 500ms 대기
        await new Promise((r) => setTimeout(r, 500));
      }

      await this.syncLog.complete(log.id, updated);
      console.log(`[CommitteeSync] Completed: ${updated} updated, ${skipped} skipped`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.syncLog.fail(log.id, msg);
      console.error(`[CommitteeSync] Failed: ${msg}`);
      throw error;
    }
  }

  /**
   * 국회 웹사이트에서 특정 의원의 위원회 경력을 크롤링.
   */
  private async fetchCommitteeHistory(memberId: string, termId: number): Promise<CommitteeEntry[]> {
    const url =
      `https://www.assembly.go.kr/portal/assm/assmMemb/memberProfile.do` +
      `?monaCd=${memberId}&st=${termId}&viewType=CONTBODY&tabId=P13`;

    const res = await fetch(url, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    return this.parseCommitteeHistory(html, termId);
  }

  /**
   * HTML에서 위원회 경력 전체 이력을 파싱.
   *
   * HTML 구조:
   *   <li>
   *     <strong>2022.07.22 ~ 2024.05.29</strong>
   *     <span>제21대 국토교통위원회</span>
   *   </li>
   *
   * 시작일 기준 오름차순 정렬하여 반환.
   */
  private parseCommitteeHistory(html: string, termId: number): CommitteeEntry[] {
    const termPrefix = `제${termId}대`;
    const liRegex = /<strong>([^<]+)<\/strong>\s*<span>([^<]+)<\/span>/g;
    const entries: CommitteeEntry[] = [];

    let match;
    while ((match = liRegex.exec(html)) !== null) {
      const dateStr = match[1].trim();
      const text = match[2].trim();

      if (!text.includes(termPrefix)) continue;

      const committeeName = text.replace(termPrefix, '').trim();
      if (!committeeName || !committeeName.includes('위원회')) continue;

      const dateParts = dateStr.split('~').map((s) => s.trim());
      const startDate = dateParts[0] || '';
      const endDate = dateParts[1] || null; // 종료일 없으면 null(현재 소속)

      entries.push({ name: committeeName, startDate, endDate });
    }

    // 시작일 기준 오름차순 정렬
    entries.sort((a, b) => a.startDate.localeCompare(b.startDate));

    return entries;
  }

  /**
   * 전체 이력에서 마지막 소속 위원회 추출.
   * 종료일이 가장 최근(또는 null=현재 소속)인 위원회들을 반환.
   */
  private extractLatestCommittees(history: CommitteeEntry[]): string[] {
    if (history.length === 0) return [];

    // 종료일 기준 내림차순 정렬 (null은 현재 소속이므로 가장 앞)
    const sorted = [...history].sort((a, b) => {
      const aEnd = a.endDate ?? '9999.12.31';
      const bEnd = b.endDate ?? '9999.12.31';
      return bEnd.localeCompare(aEnd);
    });

    const latestEnd = sorted[0].endDate ?? '9999.12.31';
    const latestCommittees = sorted
      .filter((e) => (e.endDate ?? '9999.12.31') === latestEnd)
      .map((e) => e.name);

    return [...new Set(latestCommittees)];
  }
}
