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
import { matchRaceFromLabel } from './poll-race-matcher';
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
          ...(options.reprocess
            ? {}
            : { responses: { none: {} } }),
        },
        select: {
          id: true,
          nttId: true,
          agency: true,
          sido: true,
          sigungu: true,
          pollName: true,
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

          // race 매칭 + PollResponse 적재
          let extractedForPoll = 0;
          for (const q of questions) {
            // 첫 응답의 후보명으로 race 추론 (raceLabel이 미식별일 때 fallback)
            const firstCandidate = q.responses.find((r) => r.candidateName)?.candidateName ?? null;
            const raceId = await matchRaceFromLabel(this.prisma, {
              raceLabel: q.raceLabel ?? '',
              sido: poll.sido,
              sigungu: poll.sigungu,
              candidateName: firstCandidate,
            });

            // PollRace M:N 관계 upsert (raceId 있을 때만)
            if (raceId !== null) {
              await this.prisma.pollRace.upsert({
                where: { pollId_raceId: { pollId: poll.id, raceId } },
                create: { pollId: poll.id, raceId },
                update: {},
              });
            }

            for (const r of q.responses) {
              const partyId = r.partyName ? await this.lookupPartyId(r.partyName) : null;
              // 후보 ID 매칭 (race 매칭 성공 + 후보명 있을 때만 시도)
              const candidateId =
                raceId !== null && r.candidateName
                  ? await this.lookupCandidateId(raceId, r.candidateName)
                  : null;

              await this.prisma.pollResponse.create({
                data: {
                  pollId: poll.id,
                  raceId,
                  questionType: q.questionType,
                  questionText: q.questionText,
                  candidateId,
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
        console.warn(`[PollResponseSync] pdftotext failed for ${storagePath}: ${res.stderr.toString()}`);
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
}
