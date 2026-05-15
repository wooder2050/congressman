import { PrismaClient } from '@prisma/client';
import { NecApiService } from './nec-api.service';
import { SyncLogService } from './sync-log.service';
import { getPartyId, getPartyColor } from '../constants/party-map';
import { NEC_TYPE_TO_ELECTION_TYPE, PROPORTIONAL_NEC_CODES } from '../constants/nec-election-map';
import { normalizeSido, normalizeSigungu } from '../constants/region-normalize';

/** NEC 후보자 API 응답 row */
interface NecCandidateRow {
  sgId: string;
  sgTypecode: string;
  sggName: string; // 선거구명
  sdName: string; // 시도명
  wiwName: string; // 구시군명
  giho: string; // 기호
  name: string; // 후보자명
  jdName: string; // 정당명
  birthday: string; // 생년월일
  age: string;
  addr: string;
  jobId: string;
  job: string; // 직업
  edu: string; // 학력
  career1: string; // 경력1
  career2: string; // 경력2
  gender: string; // 성별
  status: string; // 등록상태
  huboid: string; // 후보자 ID
}

/** NEC 당선인 API 응답 row */
interface NecWinnerRow {
  sgId: string;
  sgTypecode: string;
  sggName: string;
  sdName: string;
  wiwName: string;
  giho: string;
  name: string;
  jdName: string;
  dugsu: string; // 득표수
  dugyul: string; // 득표율
  huboid: string;
}

export class LocalElectionSyncService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly necApi: NecApiService,
    private readonly syncLog: SyncLogService,
  ) {}

  /**
   * NEC API에서 선거구 + 후보자 데이터를 동기화
   */
  async syncAll(electionId: string) {
    await this.syncCandidates(electionId);
  }

  /**
   * NEC API에서 후보자 정보를 가져와 race + candidate를 upsert
   */
  async syncCandidates(electionId: string) {
    const log = await this.syncLog.start('local-election-candidates');
    let totalCount = 0;

    try {
      const election = await this.prisma.localElection.findUnique({
        where: { id: electionId },
      });
      if (!election) throw new Error(`LocalElection not found: ${electionId}`);

      // sgId 추출 (예: "20260603")
      const sgId = election.electionDate.toISOString().slice(0, 10).replace(/-/g, '') ?? '';

      // 선거유형별로 후보자 데이터 동기화
      for (const [necCode, electionType] of Object.entries(NEC_TYPE_TO_ELECTION_TYPE)) {
        console.log(
          `[LocalElectionSync] Syncing candidates for type ${electionType} (code ${necCode})...`,
        );

        const rows = await this.necApi.fetchAll<NecCandidateRow>(
          'PofelcddInfoInqireService',
          'getPofelcddRegistSttusInfoInqire',
          { sgId, sgTypecode: necCode },
        );

        const isProportional = PROPORTIONAL_NEC_CODES.has(necCode);

        for (const row of rows) {
          // race upsert — 비례대표는 scope 단위 1개 race로 통합
          // - code 5 (광역 비례): sido 단위 → district = "비례대표"
          // - code 7 (기초 비례): sido + sigungu 단위 → district = "비례대표"
          // - 그 외 지역구: NEC sggName/wiwName 그대로
          const sido = normalizeSido(row.sdName);
          let sigungu: string;
          let district: string;
          if (necCode === '5') {
            sigungu = '';
            district = '비례대표';
          } else if (necCode === '7') {
            sigungu = normalizeSigungu(row.wiwName);
            district = '비례대표';
          } else {
            sigungu = ['2', '10'].includes(necCode) ? '' : normalizeSigungu(row.wiwName);
            district = ['2', '3', '10'].includes(necCode) ? '' : (row.sggName ?? '');
          }
          const displayName = this.buildDisplayName(
            electionType,
            sido,
            sigungu,
            district,
            row.sggName,
          );

          const race = await this.prisma.localElectionRace.upsert({
            where: {
              electionId_electionType_sido_sigungu_district: {
                electionId,
                electionType,
                sido,
                sigungu,
                district,
              },
            },
            create: {
              electionId,
              electionType,
              sido,
              sigungu,
              district,
              displayName,
              sgId,
              sgTypecode: necCode,
            },
            update: { displayName, sgId, sgTypecode: necCode },
          });

          // party 해석 — 미매핑 정당은 자동 생성
          let partyId: string | null = null;
          if (row.jdName) {
            partyId = getPartyId(row.jdName);
            // unknown- 접두사 정당이면 DB에 없을 수 있으므로 자동 생성
            if (partyId.startsWith('unknown-')) {
              await this.prisma.party.upsert({
                where: { id: partyId },
                update: {},
                create: {
                  id: partyId,
                  name: row.jdName,
                  shortName: row.jdName,
                  color: getPartyColor(partyId),
                },
              });
            }
          }

          // candidate upsert
          // 비례대표는 한 race에 같은 정당 후보자가 여러 명(추천순위 1~N) 들어가며
          // 동명이인 가능성이 있어 huboid를 기준으로 식별. NEC가 huboid를 안 주면
          // raceId_name fallback.
          const career = [row.career1, row.career2].filter(Boolean).join('\n');
          const candidateData = {
            partyId,
            birthDate: row.birthday ?? null,
            gender: row.gender ?? null,
            career: career || null,
            education: row.edu ?? null,
            candidateNumber: row.giho ? parseInt(row.giho, 10) : null,
            huboid: row.huboid ?? '',
          };

          // 1순위: huboid로 식별 (NEC 후보자 ID — 가장 안전)
          // 2순위: raceId+name unique로 fallback (동명이인은 sync 단계에서는 같은 사람으로 취급, 추후 huboid 받으면 정정됨)
          let existingId: number | null = null;
          if (row.huboid) {
            const byHuboid = await this.prisma.localElectionCandidate.findFirst({
              where: { huboid: row.huboid },
              select: { id: true },
            });
            existingId = byHuboid?.id ?? null;
          }
          if (existingId === null) {
            const byName = await this.prisma.localElectionCandidate.findUnique({
              where: { raceId_name: { raceId: race.id, name: row.name } },
              select: { id: true },
            });
            existingId = byName?.id ?? null;
          }
          if (existingId !== null) {
            await this.prisma.localElectionCandidate.update({
              where: { id: existingId },
              data: { raceId: race.id, name: row.name, ...candidateData },
            });
          } else {
            await this.prisma.localElectionCandidate.create({
              data: {
                raceId: race.id,
                name: row.name,
                status: 'registered',
                ...candidateData,
              },
            });
          }

          totalCount++;
        }

        // 비례대표 통합 race일 경우, 정당명에서 displayName을 좀 더 직관적으로 정리
        if (isProportional) {
          // (현재는 buildDisplayName이 충분. 추후 후보자 수 표시 등 필요 시 여기서 후처리)
        }
      }

      await this.syncLog.complete(log.id, totalCount);
      console.log(`[LocalElectionSync] Synced ${totalCount} candidates total`);
    } catch (error) {
      await this.syncLog.fail(log.id, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * NEC 당선인 API에서 결과를 동기화
   */
  async syncResults(electionId: string) {
    const log = await this.syncLog.start('local-election-results');
    let totalCount = 0;

    try {
      const election = await this.prisma.localElection.findUnique({
        where: { id: electionId },
      });
      if (!election) throw new Error(`LocalElection not found: ${electionId}`);

      const sgId = election.electionDate.toISOString().slice(0, 10).replace(/-/g, '') ?? '';

      for (const necCode of Object.keys(NEC_TYPE_TO_ELECTION_TYPE)) {
        const rows = await this.necApi.fetchAll<NecWinnerRow>(
          'WinnerInfoInqireService',
          'getWinnerInfoInqire',
          { sgId, sgTypecode: necCode },
        );

        for (const row of rows) {
          // huboid로 후보자 찾아서 결과 업데이트
          if (!row.huboid) continue;

          const candidate = await this.prisma.localElectionCandidate.findFirst({
            where: { huboid: row.huboid },
          });

          if (candidate) {
            await this.prisma.localElectionCandidate.update({
              where: { id: candidate.id },
              data: {
                isWinner: true,
                status: 'elected',
                voteCount: row.dugsu ? parseInt(row.dugsu, 10) : null,
                voteRate: row.dugyul ? parseFloat(row.dugyul) : null,
              },
            });
            totalCount++;
          }
        }
      }

      // 당선인이 1명이라도 있을 때만 completed로 변경
      if (totalCount > 0) {
        await this.prisma.localElection.update({
          where: { id: electionId },
          data: { status: 'completed' },
        });
      } else {
        console.log(`[LocalElectionSync] No winners found, keeping election status unchanged`);
      }

      await this.syncLog.complete(log.id, totalCount);
      console.log(`[LocalElectionSync] Updated ${totalCount} winners`);
    } catch (error) {
      await this.syncLog.fail(log.id, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private buildDisplayName(
    electionType: string,
    sido: string,
    sigungu: string,
    district: string,
    sggName: string,
  ): string {
    switch (electionType) {
      case 'governor': {
        // "서울특별시" → "서울특별시장", "경기도" → "경기도지사"
        if (sido.endsWith('도')) return `${sido}지사`;
        // 시로 끝나는 경우: 서울특별시 → 서울특별시장 (시 제거 후 시장)
        if (sido.endsWith('시')) return `${sido.slice(0, -1)}시장`;
        return `${sido}장`;
      }
      case 'superintendent':
        return `${sido} 교육감`;
      case 'mayor': {
        if (!sigungu) return sggName;
        // 종로구 → 종로구청장, 기장군 → 기장군수, 수원시 → 수원시장
        if (sigungu.endsWith('구')) return `${sigungu.slice(0, -1)}구청장`;
        if (sigungu.endsWith('군')) return `${sigungu.slice(0, -1)}군수`;
        return `${sigungu.slice(0, -1)}시장`;
      }
      case 'metro-council':
      case 'local-council':
        return sggName || `${sido} ${sigungu} ${district}`.trim();
      case 'metro-proportional':
        return `${sido} 광역의원 비례대표`;
      case 'local-proportional':
        return sigungu ? `${sido} ${sigungu} 기초의원 비례대표` : `${sido} 기초의원 비례대표`;
      default:
        return sggName;
    }
  }
}
