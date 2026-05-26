/**
 * PollResponse sync 서비스
 *
 * 작업 흐름:
 *   1. status='downloaded'인 PollAttachment(kind='result')를 조회
 *   2. Storage에서 PDF 다운로드
 *   3. pdftotext -layout으로 텍스트 추출
 *   4. 조사기관(agency)에 맞는 파서 선택 → ParsedQuestion[] 추출
 *   5. race 자동 매칭 → PollResponse 적재
 *   6. 매칭 실패 시 raceId=null로 적재 (관리자 UI에서 수동 교정)
 */

import { spawnSync } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { findParser } from './pdf-parsers';
import { matchDistrictFromPoll, matchRaceFromLabel } from './poll-race-matcher';
import { SyncLogService } from './sync-log.service';

const STORAGE_BUCKET = 'nesdc-polls';

export class PollResponseSyncService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly syncLog: SyncLogService,
  ) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    this.supabase = createClient(url, key);
  }

  async syncResponses(options: { limit?: number; reprocess?: boolean } = {}): Promise<void> {
    const log = await this.syncLog.start('poll-responses');
    let processed = 0;
    let extracted = 0;
    let failed = 0;
    let skipped = 0;

    try {
      // 처리 대상: 다운로드 완료 + result kind + (재처리 옵션이 아니면) 아직 응답 미적재된 poll
      const polls = await this.prisma.poll.findMany({
        where: {
          attachments: {
            some: { status: 'downloaded', kind: 'result' },
          },
          ...(options.reprocess ? {} : { responses: { none: {} } }),
        },
        select: {
          id: true,
          nttId: true,
          agency: true,
          sido: true,
          sigungu: true,
          pollName: true,
          electionCategory: true,
          attachments: {
            where: { status: 'downloaded', kind: 'result' },
            select: { id: true, storagePath: true, fileName: true },
          },
        },
        take: options.limit,
      });

      console.log(`[PollResponseSync] ${polls.length} polls pending`);

      for (const poll of polls) {
        processed++;
        try {
          const parser = findParser(poll.agency);
          if (!parser) {
            skipped++;
            continue;
          }

          // 첫 result PDF 한 개만 처리 (보통 결과표는 1개)
          const att = poll.attachments[0];
          if (!att || !att.storagePath) {
            skipped++;
            continue;
          }

          const text = await this.downloadAndExtractText(att.storagePath);
          if (!text) {
            failed++;
            continue;
          }

          const questions = parser.parse({
            agency: poll.agency,
            fileName: att.fileName,
            text,
          });

          if (questions.length === 0) {
            // 파서가 결과 없음 — 추후 디버그용
            await this.prisma.poll.update({
              where: { id: poll.id },
              data: {
                parseStatus: 'failed',
                parseError: `${parser.name}: 0 questions extracted`,
              },
            });
            failed++;
            continue;
          }

          // race(지방선거) 또는 district(재보궐) 매칭 + PollResponse 적재
          const isByElection = poll.electionCategory === '2026년 재·보궐선거';
          let extractedForPoll = 0;

          // 재보궐은 Poll 메타로 district 단일 매칭 (PDF raceLabel과 관계없이)
          const districtIdForPoll = isByElection
            ? await matchDistrictFromPoll(this.prisma, {
                sido: poll.sido,
                sigungu: poll.sigungu,
              })
            : null;
          if (districtIdForPoll !== null) {
            await this.prisma.pollDistrict.upsert({
              where: {
                pollId_districtId: { pollId: poll.id, districtId: districtIdForPoll },
              },
              create: { pollId: poll.id, districtId: districtIdForPoll },
              update: {},
            });
          }

          for (const q of questions) {
            // 지방선거: race 매칭
            const firstCandidate = q.responses.find((r) => r.candidateName)?.candidateName ?? null;
            let raceId = isByElection
              ? null
              : await matchRaceFromLabel(this.prisma, {
                  raceLabel: q.raceLabel ?? '',
                  sido: poll.sido,
                  sigungu: poll.sigungu,
                  candidateName: firstCandidate,
                });

            // HRI/YRK 같이 raceLabel·candidateName 둘 다 비어있는 파서용 fallback:
            // pollName에서 표 종류 추론 후 sido + 표 종류로 race 매칭.
            if (!isByElection && raceId === null) {
              raceId = await this.fallbackRaceMatchFromPoll(poll);
            }

            if (raceId !== null) {
              await this.prisma.pollRace.upsert({
                where: { pollId_raceId: { pollId: poll.id, raceId } },
                create: { pollId: poll.id, raceId },
                update: {},
              });
            }

            // 파서가 candidateName/partyName을 채우지 못한 경우 (HRI 등):
            // race(지방선거) 또는 district(재보궐)의 후보 명단을 candidateNumber 순으로 가져와
            // q.responses 순서에 매칭.
            const allNameless = q.responses.every((r) => !r.candidateName);
            if (allNameless && q.responses.length > 0) {
              let dbCandidates: { name: string; partyId: string | null }[] = [];
              if (isByElection && districtIdForPoll !== null) {
                const cs = await this.prisma.candidate.findMany({
                  where: { districtId: districtIdForPoll },
                  select: { name: true, partyId: true, candidateNumber: true },
                  orderBy: [{ candidateNumber: 'asc' }, { id: 'asc' }],
                });
                dbCandidates = cs.map((c) => ({ name: c.name, partyId: c.partyId }));
              } else if (!isByElection && raceId !== null) {
                const cs = await this.prisma.localElectionCandidate.findMany({
                  where: { raceId },
                  select: { name: true, partyId: true, candidateNumber: true },
                  orderBy: [{ candidateNumber: 'asc' }, { id: 'asc' }],
                });
                dbCandidates = cs.map((c) => ({ name: c.name, partyId: c.partyId }));
              }
              // 응답이 DB 후보 수보다 많으면 trim (파서가 기타 후보 등 보조 컬럼까지 포함했을 때)
              if (dbCandidates.length > 0 && q.responses.length > dbCandidates.length) {
                q.responses.splice(dbCandidates.length);
              }
              // 응답 개수 = DB 후보 개수일 때만 후보명 매핑.
              // 일치하지 않으면 candidateName을 빈 채로 두어 잘못된 매핑 방지.
              // (PDF 컬럼 순서와 DB candidateNumber 순서가 다른 경우 — 예: 인천시장
              //  PDF에 김교흥이 첫 컬럼이지만 DB에는 미등록 → 데이터 매핑 불가)
              if (dbCandidates.length === q.responses.length && dbCandidates.length > 0) {
                for (let i = 0; i < q.responses.length; i++) {
                  q.responses[i].candidateName = dbCandidates[i].name;
                }
              } else if (dbCandidates.length > 0) {
                // 매핑 불가 — 이 question 자체를 건너뛴다 (사용자 화면에서 candidateName=null 응답이 보이지 않도록)
                q.responses.length = 0;
              }
            }

            // Sanity check: 합이 110%를 한참 넘으면(같은 race를 다루는 여러 표가 union되어
            // 합이 망가진 경우) 적재 skip — 잘못된 데이터가 차트에 노출되는 것 방지.
            const totalRate = q.responses.reduce((s, r) => s + r.rate, 0);
            if (totalRate > 110 || totalRate < 20) {
              continue;
            }

            for (const r of q.responses) {
              const partyId = r.partyName ? await this.lookupPartyId(r.partyName) : null;
              const candidateId =
                raceId !== null && r.candidateName
                  ? await this.lookupCandidateId(raceId, r.candidateName)
                  : null;
              const byCandidateId =
                districtIdForPoll !== null && r.candidateName
                  ? await this.lookupByCandidateId(districtIdForPoll, r.candidateName)
                  : null;

              await this.prisma.pollResponse.create({
                data: {
                  pollId: poll.id,
                  raceId,
                  districtId: districtIdForPoll,
                  questionType: q.questionType,
                  questionText: q.questionText,
                  candidateId,
                  byCandidateId,
                  candidateName: r.candidateName,
                  partyId,
                  partyName: r.partyName,
                  subgroup: r.subgroup,
                  subgroupKey: r.subgroupKey,
                  rate: r.rate,
                  sampleSize: r.sampleSize,
                  attachmentId: att.id,
                  pageNumber: q.pageNumber,
                },
              });
              extractedForPoll++;
            }
          }

          await this.prisma.poll.update({
            where: { id: poll.id },
            data: { parseStatus: 'parsed', parseError: null },
          });

          extracted += extractedForPoll;

          if (processed % 10 === 0) {
            console.log(
              `[PollResponseSync] progress ${processed}/${polls.length} (extracted=${extracted} failed=${failed} skipped=${skipped})`,
            );
          }
        } catch (e) {
          failed++;
          const msg = (e as Error).message;
          console.error(`[PollResponseSync] poll ${poll.id} failed:`, msg);
          await this.prisma.poll.update({
            where: { id: poll.id },
            data: { parseStatus: 'failed', parseError: msg },
          });
        }
      }

      console.log(
        `[PollResponseSync] done: processed=${processed} extracted=${extracted} failed=${failed} skipped=${skipped}`,
      );
      await this.syncLog.complete(log.id, extracted);
    } catch (err) {
      await this.syncLog.fail(log.id, (err as Error).message);
      throw err;
    }
  }

  private async downloadAndExtractText(storagePath: string): Promise<string | null> {
    const { data, error } = await this.supabase.storage.from(STORAGE_BUCKET).download(storagePath);
    if (error || !data) {
      console.warn(`[PollResponseSync] download failed: ${storagePath}: ${error?.message}`);
      return null;
    }
    const buf = Buffer.from(await data.arrayBuffer());

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'poll-pdf-'));
    const pdfPath = path.join(tmpDir, 'in.pdf');
    const txtPath = path.join(tmpDir, 'out.txt');
    try {
      await fs.writeFile(pdfPath, buf);
      const res = spawnSync('pdftotext', ['-layout', pdfPath, txtPath]);
      if (res.status !== 0) {
        console.warn(
          `[PollResponseSync] pdftotext failed for ${storagePath}: ${res.stderr.toString()}`,
        );
        return null;
      }
      const text = await fs.readFile(txtPath, 'utf-8');
      return text;
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }

  private partyIdCache = new Map<string, string | null>();
  private async lookupPartyId(partyName: string): Promise<string | null> {
    if (this.partyIdCache.has(partyName)) return this.partyIdCache.get(partyName)!;
    const party = await this.prisma.party.findFirst({
      where: { OR: [{ name: partyName }, { shortName: partyName }] },
      select: { id: true },
    });
    const id = party?.id ?? null;
    this.partyIdCache.set(partyName, id);
    return id;
  }

  private async lookupCandidateId(raceId: number, candidateName: string): Promise<number | null> {
    const cand = await this.prisma.localElectionCandidate.findUnique({
      where: { raceId_name: { raceId, name: candidateName } },
      select: { id: true },
    });
    return cand?.id ?? null;
  }

  private async lookupByCandidateId(
    districtId: number,
    candidateName: string,
  ): Promise<number | null> {
    const cand = await this.prisma.candidate.findUnique({
      where: { districtId_name: { districtId, name: candidateName } },
      select: { id: true },
    });
    return cand?.id ?? null;
  }

  /**
   * raceLabel·candidateName이 비어있는 파서(HRI·YRK)용 fallback:
   * Poll.pollName에 "광역단체장"/"교육감"/"기초단체장" 키워드가 있으면
   * Poll.sido로 해당 타입 race를 찾는다. 광역단체장·교육감은 sigungu='' 단일,
   * 기초단체장은 Poll.sigungu와 매칭.
   */
  private async fallbackRaceMatchFromPoll(poll: {
    sido: string;
    sigungu: string;
    pollName: string;
  }): Promise<number | null> {
    let electionType: string | null = null;
    if (/광역단체장/.test(poll.pollName)) electionType = 'governor';
    else if (/교육감/.test(poll.pollName)) electionType = 'superintendent';
    else if (/기초단체장/.test(poll.pollName)) electionType = 'mayor';
    if (!electionType) return null;

    if (electionType === 'governor' || electionType === 'superintendent') {
      const race = await this.prisma.localElectionRace.findFirst({
        where: {
          electionId: 'local-2026',
          electionType,
          sido: poll.sido,
          sigungu: '',
        },
        select: { id: true },
      });
      return race?.id ?? null;
    }

    // mayor: sigungu 매칭 (Poll.sigungu가 race 시·군·구명과 일치해야 함)
    if (!poll.sigungu || poll.sigungu === '전체') return null;
    const race = await this.prisma.localElectionRace.findFirst({
      where: {
        electionId: 'local-2026',
        electionType: 'mayor',
        sido: poll.sido,
        sigungu: poll.sigungu,
      },
      select: { id: true },
    });
    return race?.id ?? null;
  }
}
