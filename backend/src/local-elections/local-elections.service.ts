import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ALLOWED_SIDO_LIST } from './region-allowlist';

function getCacheTTL(status: string): number {
  switch (status) {
    case 'upcoming':
      return 3600; // 1시간
    case 'active':
      return 60; // 1분 (선거일)
    case 'completed':
      return 86400; // 24시간
    default:
      return 3600;
  }
}

interface RaceFilter {
  type?: string;
  sido?: string;
  sigungu?: string;
  q?: string;
  page: number;
  limit: number;
}

@Injectable()
export class LocalElectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** 지방선거 목록 */
  async findAll() {
    const key = 'local-elections:list';
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const elections = await this.prisma.localElection.findMany({
      include: { races: { select: { id: true, electionType: true } } },
      orderBy: { electionDate: 'desc' },
    });

    const result = elections.map((e) => {
      const raceCounts: Record<string, number> = {};
      for (const r of e.races) {
        raceCounts[r.electionType] = (raceCounts[r.electionType] ?? 0) + 1;
      }
      return {
        id: e.id,
        name: e.name,
        electionDate: e.electionDate.toISOString().split('T')[0],
        status: e.status,
        raceCounts,
      };
    });

    await this.redis.set(key, result, 3600);
    return result;
  }

  /** 지방선거 개요 */
  async findById(id: string) {
    const key = `local-elections:${id}:overview`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const election = await this.prisma.localElection.findUnique({
      where: { id },
      include: {
        races: {
          select: {
            id: true,
            electionType: true,
            sido: true,
            _count: { select: { candidates: true } },
          },
        },
      },
    });

    if (!election) return null;

    // 유형별 race 수
    const raceCounts: Record<string, number> = {};
    let totalCandidates = 0;
    const regionMap = new Map<
      string,
      { raceCounts: Record<string, number>; totalCandidates: number }
    >();

    for (const r of election.races) {
      raceCounts[r.electionType] = (raceCounts[r.electionType] ?? 0) + 1;
      totalCandidates += r._count.candidates;

      if (!regionMap.has(r.sido)) {
        regionMap.set(r.sido, { raceCounts: {}, totalCandidates: 0 });
      }
      const region = regionMap.get(r.sido)!;
      region.raceCounts[r.electionType] = (region.raceCounts[r.electionType] ?? 0) + 1;
      region.totalCandidates += r._count.candidates;
    }

    // 시도 약어 생성
    const sidoShort = (sido: string) =>
      sido
        .replace(/특별자치도|특별자치시|특별시|광역시|도/, '')
        .replace('전북', '전북')
        .replace('강원', '강원') || sido.slice(0, 2);

    const regionSummary = Array.from(regionMap.entries())
      .map(([sido, data]) => ({
        sido,
        sidoShort: sidoShort(sido),
        ...data,
      }))
      .sort((a, b) => a.sido.localeCompare(b.sido));

    const result = {
      id: election.id,
      name: election.name,
      electionDate: election.electionDate.toISOString().split('T')[0],
      status: election.status,
      description: election.description,
      ordinal: election.ordinal,
      raceCounts,
      totalCandidates,
      regionSummary,
    };

    await this.redis.set(key, result, getCacheTTL(election.status));
    return result;
  }

  /** sitemap용: 후보가 1명 이상인 race 최소 필드만 반환 */
  async getIndexableRaces(id: string) {
    const key = `local-elections:${id}:indexable-races:v1`;
    const cached =
      await this.redis.get<
        { raceId: number; electionType: string; sido: string; sigungu: string }[]
      >(key);
    if (cached) return cached;

    const races = await this.prisma.localElectionRace.findMany({
      where: { electionId: id, candidates: { some: {} } },
      select: { id: true, electionType: true, sido: true, sigungu: true },
      orderBy: [{ sido: 'asc' }, { sigungu: 'asc' }, { id: 'asc' }],
    });

    const result = races.map((r) => ({
      raceId: r.id,
      electionType: r.electionType,
      sido: r.sido,
      sigungu: r.sigungu,
    }));

    await this.redis.set(key, result, 3600);
    return result;
  }

  /** race 목록 (필터 + 페이지네이션 + 검색) */
  async getRaces(id: string, filter: RaceFilter) {
    const where: Record<string, unknown> = {
      electionId: id,
      sido: { in: [...ALLOWED_SIDO_LIST] },
    };
    if (filter.type) where.electionType = filter.type;
    if (filter.sido) where.sido = filter.sido;
    if (filter.sigungu) where.sigungu = filter.sigungu;
    if (filter.q) {
      where.OR = [
        { displayName: { contains: filter.q, mode: 'insensitive' } },
        { sigungu: { contains: filter.q, mode: 'insensitive' } },
        { district: { contains: filter.q, mode: 'insensitive' } },
        { candidates: { some: { name: { contains: filter.q, mode: 'insensitive' } } } },
      ];
    }

    const [races, total] = await Promise.all([
      this.prisma.localElectionRace.findMany({
        where,
        include: {
          candidates: {
            include: { party: true },
            orderBy: { candidateNumber: 'asc' },
            take: 3,
          },
          _count: { select: { candidates: true } },
        },
        orderBy: [{ sido: 'asc' }, { sigungu: 'asc' }, { district: 'asc' }],
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      this.prisma.localElectionRace.count({ where }),
    ]);

    return {
      races: races.map((r) => ({
        id: r.id,
        electionType: r.electionType,
        sido: r.sido,
        sigungu: r.sigungu,
        district: r.district,
        displayName: r.displayName,
        seatCount: r.seatCount,
        candidateCount: r._count.candidates,
        topCandidates: r.candidates.map((c) => ({
          id: c.id,
          name: c.name,
          party: c.party
            ? {
                id: c.party.id,
                name: c.party.name,
                shortName: c.party.shortName,
                color: c.party.color,
              }
            : null,
          candidateNumber: c.candidateNumber,
          photoUrl: c.photoUrl,
        })),
      })),
      total,
    };
  }

  /** race 상세 + 후보자 전체 */
  async getRaceDetail(electionId: string, raceId: number) {
    const key = `local-elections:${electionId}:race:${raceId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const race = await this.prisma.localElectionRace.findFirst({
      where: { id: raceId, electionId },
      include: {
        election: { select: { status: true } },
        candidates: {
          include: { party: true },
          orderBy: { candidateNumber: 'asc' },
        },
      },
    });

    if (!race) return null;

    const result = {
      id: race.id,
      electionType: race.electionType,
      sido: race.sido,
      sigungu: race.sigungu,
      district: race.district,
      displayName: race.displayName,
      seatCount: race.seatCount,
      candidates: race.candidates.map((c) => ({
        id: c.id,
        name: c.name,
        party: c.party
          ? {
              id: c.party.id,
              name: c.party.name,
              shortName: c.party.shortName,
              color: c.party.color,
            }
          : null,
        photoUrl: c.photoUrl,
        birthDate: c.birthDate,
        gender: c.gender,
        career: c.career,
        education: c.education,
        slogan: c.slogan,
        pledges: c.pledges as {
          category: string;
          title: string;
          description: string;
        }[],
        assets: c.assets,
        candidateNumber: c.candidateNumber,
        status: c.status,
        voteCount: c.voteCount,
        voteRate: c.voteRate,
        isWinner: c.isWinner,
        memberIdRef: c.memberIdRef,
      })),
    };

    await this.redis.set(key, result, getCacheTTL(race.election.status));
    return result;
  }

  /** 17개 시도 요약 */
  async getRegions(id: string) {
    const key = `local-elections:${id}:regions:v2`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const races = await this.prisma.localElectionRace.findMany({
      where: { electionId: id, sido: { in: [...ALLOWED_SIDO_LIST] } },
      select: {
        electionType: true,
        sido: true,
        _count: { select: { candidates: true } },
      },
    });

    const regionMap = new Map<
      string,
      { raceCounts: Record<string, number>; totalCandidates: number }
    >();

    for (const r of races) {
      if (!regionMap.has(r.sido)) {
        regionMap.set(r.sido, { raceCounts: {}, totalCandidates: 0 });
      }
      const region = regionMap.get(r.sido)!;
      region.raceCounts[r.electionType] = (region.raceCounts[r.electionType] ?? 0) + 1;
      region.totalCandidates += r._count.candidates;
    }

    const sidoShort = (sido: string) =>
      sido
        .replace(/특별자치도|특별자치시|특별시|광역시|도/, '')
        .replace('전북', '전북')
        .replace('강원', '강원') || sido.slice(0, 2);

    const result = Array.from(regionMap.entries())
      .map(([sido, data]) => ({
        sido,
        sidoShort: sidoShort(sido),
        ...data,
      }))
      .sort((a, b) => a.sido.localeCompare(b.sido));

    await this.redis.set(key, result, 3600);
    return result;
  }

  /**
   * 시도별 전체 race + 투표용지(7장) 분류 + 시군구별 그룹핑.
   *
   * 한국 유권자의 mental model("내가 받는 투표용지")에 맞춰 race를 분류:
   *  1. governor (시도지사)
   *  2. superintendent (교육감)
   *  3. metro-council (광역의원 지역구)
   *  4. metro-proportional (광역의원 비례)
   *  5. mayor (기초단체장)
   *  6. local-council (기초의원 지역구)
   *  7. local-proportional (기초의원 비례)
   *
   * 시군구별 그룹핑은 클라이언트가 "내 동네"만 선택해서 볼 수 있게 한다.
   */
  async getRegionDetail(id: string, sido: string) {
    const key = `local-elections:${id}:region:${sido}:v2`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const races = await this.prisma.localElectionRace.findMany({
      where: { electionId: id, sido },
      include: {
        candidates: {
          include: { party: true },
          orderBy: { candidateNumber: 'asc' },
          take: 3,
        },
        _count: { select: { candidates: true } },
      },
      orderBy: [{ electionType: 'asc' }, { sigungu: 'asc' }, { district: 'asc' }],
    });

    const flatRaces = races.map((r) => ({
      id: r.id,
      electionType: r.electionType,
      sido: r.sido,
      sigungu: r.sigungu,
      district: r.district,
      displayName: r.displayName,
      seatCount: r.seatCount,
      candidateCount: r._count.candidates,
      topCandidates: r.candidates.map((c) => ({
        id: c.id,
        name: c.name,
        party: c.party
          ? {
              id: c.party.id,
              name: c.party.name,
              shortName: c.party.shortName,
              color: c.party.color,
            }
          : null,
        candidateNumber: c.candidateNumber,
        photoUrl: c.photoUrl,
      })),
    }));

    // 시군구 목록 (race 수와 함께)
    const sigunguCountMap = new Map<string, number>();
    for (const r of flatRaces) {
      if (!r.sigungu) continue;
      sigunguCountMap.set(r.sigungu, (sigunguCountMap.get(r.sigungu) ?? 0) + 1);
    }
    const sigunguList = Array.from(sigunguCountMap.entries())
      .map(([name, raceCount]) => ({ name, raceCount }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    const result = {
      sido,
      races: flatRaces,
      sigunguList,
    };

    await this.redis.set(key, result, 3600);
    return result;
  }

  /** 통계 (정당별, 유형별) */
  async getStats(id: string) {
    const key = `local-elections:${id}:stats`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const races = await this.prisma.localElectionRace.findMany({
      where: { electionId: id },
      select: { electionType: true },
    });

    const candidates = await this.prisma.localElectionCandidate.findMany({
      where: { race: { electionId: id } },
      select: { partyId: true, status: true, race: { select: { electionType: true } } },
    });

    // 유형별 race 수
    const racesByType: Record<string, number> = {};
    for (const r of races) {
      racesByType[r.electionType] = (racesByType[r.electionType] ?? 0) + 1;
    }

    // 정당별 후보 수
    const candidatesByParty: Record<string, number> = {};
    for (const c of candidates) {
      const pid = c.partyId ?? 'independent';
      candidatesByParty[pid] = (candidatesByParty[pid] ?? 0) + 1;
    }

    // 유형별 후보 수
    const candidatesByType: Record<string, number> = {};
    for (const c of candidates) {
      candidatesByType[c.race.electionType] = (candidatesByType[c.race.electionType] ?? 0) + 1;
    }

    const result = {
      totalRaces: races.length,
      totalCandidates: candidates.length,
      racesByType,
      candidatesByType,
      candidatesByParty,
    };

    await this.redis.set(key, result, 3600);
    return result;
  }
}
