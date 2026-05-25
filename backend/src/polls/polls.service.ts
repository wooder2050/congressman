import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const DEFAULT_TTL_SECONDS = 3600;
const NESDC_VIEW_BASE = 'https://www.nesdc.go.kr/portal/bbs/B0000005/view.do';

type PollsListFilter = {
  electionCategory?: string; // '제9회 전국동시지방선거' | '2026년 재·보궐선거'
  sido?: string;
  agency?: string;
  from?: string; // YYYY-MM-DD (registeredAt 기준)
  to?: string;
  page: number;
  limit: number;
};

function pollListItem(p: {
  id: number;
  nttId: string;
  registrationNo: string | null;
  electionCategory: string;
  pollName: string;
  agency: string;
  client: string;
  sido: string;
  sigungu: string;
  sampleSize: number | null;
  responseRate: number | null;
  marginOfError: number | null;
  surveyStartedAt: Date | null;
  surveyEndedAt: Date | null;
  registeredAt: Date;
  publishedAt: Date | null;
  surveyMethod: string | null;
}) {
  return {
    id: p.id,
    nttId: p.nttId,
    registrationNo: p.registrationNo,
    electionCategory: p.electionCategory,
    pollName: p.pollName,
    agency: p.agency,
    client: p.client,
    sido: p.sido,
    sigungu: p.sigungu,
    sampleSize: p.sampleSize,
    responseRate: p.responseRate,
    marginOfError: p.marginOfError,
    surveyStartedAt: p.surveyStartedAt?.toISOString() ?? null,
    surveyEndedAt: p.surveyEndedAt?.toISOString() ?? null,
    registeredAt: p.registeredAt.toISOString(),
    publishedAt: p.publishedAt?.toISOString() ?? null,
    surveyMethod: p.surveyMethod,
    nesdcUrl: `${NESDC_VIEW_BASE}?nttId=${p.nttId}&menuNo=200467`,
  };
}

@Injectable()
export class PollsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** 필터 → 캐시 키 생성 (입력 정규화 후 결정적 해시) */
  private listCacheKey(filter: PollsListFilter): string {
    const parts = [
      filter.electionCategory ?? '',
      filter.sido ?? '',
      filter.agency ?? '',
      filter.from ?? '',
      filter.to ?? '',
      String(filter.page),
      String(filter.limit),
    ];
    return `polls:list:${parts.join('|')}:v1`;
  }

  async list(filter: PollsListFilter) {
    const key = this.listCacheKey(filter);
    const cached = await this.redis.get<unknown>(key);
    if (cached) return cached;

    const where: Prisma.PollWhereInput = {};
    if (filter.electionCategory) where.electionCategory = filter.electionCategory;
    if (filter.sido) where.sido = filter.sido;
    if (filter.agency) where.agency = filter.agency;
    if (filter.from || filter.to) {
      where.registeredAt = {};
      if (filter.from) where.registeredAt.gte = new Date(`${filter.from}T00:00:00+09:00`);
      if (filter.to) where.registeredAt.lte = new Date(`${filter.to}T23:59:59+09:00`);
    }

    const [total, polls] = await this.prisma.$transaction([
      this.prisma.poll.count({ where }),
      this.prisma.poll.findMany({
        where,
        orderBy: [{ registeredAt: 'desc' }, { id: 'desc' }],
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        select: {
          id: true,
          nttId: true,
          registrationNo: true,
          electionCategory: true,
          pollName: true,
          agency: true,
          client: true,
          sido: true,
          sigungu: true,
          sampleSize: true,
          responseRate: true,
          marginOfError: true,
          surveyStartedAt: true,
          surveyEndedAt: true,
          registeredAt: true,
          publishedAt: true,
          surveyMethod: true,
        },
      }),
    ]);

    const result = {
      total,
      page: filter.page,
      limit: filter.limit,
      polls: polls.map(pollListItem),
    };
    await this.redis.set(key, result, DEFAULT_TTL_SECONDS);
    return result;
  }

  /** 메인 위젯용: 최근 조사 N건 */
  async recent(limit: number, electionCategory?: string) {
    const key = `polls:recent:${electionCategory ?? 'all'}:${limit}:v1`;
    const cached = await this.redis.get<unknown>(key);
    if (cached) return cached;

    const polls = await this.prisma.poll.findMany({
      where: electionCategory ? { electionCategory } : undefined,
      orderBy: [{ registeredAt: 'desc' }, { id: 'desc' }],
      take: limit,
      select: {
        id: true,
        nttId: true,
        registrationNo: true,
        electionCategory: true,
        pollName: true,
        agency: true,
        client: true,
        sido: true,
        sigungu: true,
        sampleSize: true,
        responseRate: true,
        marginOfError: true,
        surveyStartedAt: true,
        surveyEndedAt: true,
        registeredAt: true,
        publishedAt: true,
        surveyMethod: true,
      },
    });

    const result = polls.map(pollListItem);
    // 메인 위젯은 TTL 짧게 (30분) — 최신 등록이 빨리 반영되도록
    await this.redis.set(key, result, 1800);
    return result;
  }

  async findById(id: number) {
    const key = `polls:detail:${id}:v1`;
    const cached = await this.redis.get<unknown>(key);
    if (cached) return cached;

    const poll = await this.prisma.poll.findUnique({
      where: { id },
      include: {
        attachments: {
          select: {
            id: true,
            kind: true,
            fileName: true,
            downloadUrl: true,
            storageUrl: true,
            status: true,
          },
          orderBy: [{ kind: 'asc' }, { id: 'asc' }],
        },
        races: {
          select: {
            race: {
              select: {
                id: true,
                electionType: true,
                sido: true,
                sigungu: true,
                displayName: true,
              },
            },
          },
        },
        responses: {
          // Step 2에서 PollResponse가 채워지면 사용
          select: {
            id: true,
            raceId: true,
            questionType: true,
            questionText: true,
            candidateId: true,
            candidateName: true,
            partyId: true,
            partyName: true,
            subgroup: true,
            subgroupKey: true,
            rate: true,
            sampleSize: true,
          },
          orderBy: [{ questionType: 'asc' }, { rate: 'desc' }],
        },
      },
    });

    if (!poll) return null;

    const result = {
      ...pollListItem(poll),
      // 메타 추가 필드 (리스트보다 상세)
      surveyDays: poll.surveyDays,
      surveyMinutes: poll.surveyMinutes,
      weightedSampleSize: poll.weightedSampleSize,
      samplingFrame: poll.samplingFrame,
      contactRate: poll.contactRate,
      aaporResponseRate: poll.aaporResponseRate,
      confidenceLevel: poll.confidenceLevel,
      weightingMethod: poll.weightingMethod,
      weightingTarget: poll.weightingTarget,
      publishMedia: poll.publishMedia,
      publishMediaName: poll.publishMediaName,
      // 첨부 / race / response
      attachments: poll.attachments.map((a) => ({
        id: a.id,
        kind: a.kind,
        fileName: a.fileName,
        downloadUrl: a.storageUrl ?? a.downloadUrl,
        status: a.status,
      })),
      races: poll.races.map((pr) => pr.race),
      responses: poll.responses,
    };

    await this.redis.set(key, result, DEFAULT_TTL_SECONDS);
    return result;
  }

  /**
   * Race 상세 시계열 차트용: 해당 race에 매칭된 모든 조사의 후보별 지지율 시계열.
   * 반환:
   *   {
   *     race: { id, displayName },
   *     agencies: string[],          // 필터 옵션
   *     candidates: [{ id, name, party }],
   *     points: [
   *       { pollId, agency, surveyEndedAt, sampleSize, marginOfError,
   *         rates: { [candidateName]: number } }
   *     ]
   *   }
   */
  async timeseries(raceId: number, options: { agency?: string } = {}) {
    const key = `polls:timeseries:${raceId}:${options.agency ?? 'all'}:v1`;
    const cached = await this.redis.get<unknown>(key);
    if (cached) return cached;

    const race = await this.prisma.localElectionRace.findUnique({
      where: { id: raceId },
      select: {
        id: true,
        displayName: true,
        electionType: true,
        sido: true,
        sigungu: true,
        candidates: {
          select: {
            id: true,
            name: true,
            party: { select: { id: true, name: true, shortName: true, color: true } },
          },
          orderBy: { candidateNumber: 'asc' },
        },
      },
    });
    if (!race) return null;

    // 후보별 응답 (subgroupKey='total' 만)
    const responses = await this.prisma.pollResponse.findMany({
      where: {
        raceId,
        subgroupKey: 'total',
        questionType: 'candidate_support',
        ...(options.agency ? { poll: { agency: options.agency } } : {}),
      },
      select: {
        rate: true,
        candidateId: true,
        candidateName: true,
        partyName: true,
        sampleSize: true,
        poll: {
          select: {
            id: true,
            agency: true,
            surveyEndedAt: true,
            surveyStartedAt: true,
            sampleSize: true,
            marginOfError: true,
            responseRate: true,
            registeredAt: true,
          },
        },
      },
    });

    // poll별로 그룹핑
    type PointRow = {
      pollId: number;
      agency: string;
      surveyEndedAt: string | null;
      surveyStartedAt: string | null;
      sampleSize: number | null;
      marginOfError: number | null;
      responseRate: number | null;
      registeredAt: string;
      rates: Record<string, number>; // candidateName → rate
    };
    const byPoll = new Map<number, PointRow>();
    for (const r of responses) {
      const pid = r.poll.id;
      if (!byPoll.has(pid)) {
        byPoll.set(pid, {
          pollId: pid,
          agency: r.poll.agency,
          surveyEndedAt: r.poll.surveyEndedAt?.toISOString() ?? null,
          surveyStartedAt: r.poll.surveyStartedAt?.toISOString() ?? null,
          sampleSize: r.poll.sampleSize,
          marginOfError: r.poll.marginOfError,
          responseRate: r.poll.responseRate,
          registeredAt: r.poll.registeredAt.toISOString(),
          rates: {},
        });
      }
      const key = r.candidateName ?? r.partyName ?? '미식별';
      byPoll.get(pid)!.rates[key] = r.rate;
    }

    const points = Array.from(byPoll.values()).sort((a, b) => {
      const aTime = a.surveyEndedAt ?? a.registeredAt;
      const bTime = b.surveyEndedAt ?? b.registeredAt;
      return aTime.localeCompare(bTime);
    });

    // 조사기관 옵션 — 이 race에 매칭된 조사들의 unique agency
    const allAgencies = Array.from(new Set(responses.map((r) => r.poll.agency))).sort();

    const result = {
      race: {
        id: race.id,
        displayName: race.displayName,
        electionType: race.electionType,
        sido: race.sido,
        sigungu: race.sigungu,
      },
      candidates: race.candidates.map((c) => ({
        id: c.id,
        name: c.name,
        party: c.party,
      })),
      agencies: allAgencies,
      points,
    };

    await this.redis.set(key, result, 1800); // 30분
    return result;
  }

  /**
   * 재보궐 ElectionDistrict 시계열 차트용.
   * Race timeseries와 동일한 응답 형태 — 단, race 대신 district 정보.
   */
  async timeseriesByDistrict(districtId: number, options: { agency?: string } = {}) {
    const key = `polls:timeseries-district:${districtId}:${options.agency ?? 'all'}:v1`;
    const cached = await this.redis.get<unknown>(key);
    if (cached) return cached;

    const district = await this.prisma.electionDistrict.findUnique({
      where: { id: districtId },
      select: {
        id: true,
        district: true,
        region: true,
        candidates: {
          select: {
            id: true,
            name: true,
            party: { select: { id: true, name: true, shortName: true, color: true } },
          },
          orderBy: { candidateNumber: 'asc' },
        },
      },
    });
    if (!district) return null;

    const responses = await this.prisma.pollResponse.findMany({
      where: {
        districtId,
        subgroupKey: 'total',
        questionType: 'candidate_support',
        ...(options.agency ? { poll: { agency: options.agency } } : {}),
      },
      select: {
        rate: true,
        byCandidateId: true,
        candidateName: true,
        partyName: true,
        sampleSize: true,
        poll: {
          select: {
            id: true,
            agency: true,
            surveyEndedAt: true,
            surveyStartedAt: true,
            sampleSize: true,
            marginOfError: true,
            responseRate: true,
            registeredAt: true,
          },
        },
      },
    });

    type PointRow = {
      pollId: number;
      agency: string;
      surveyEndedAt: string | null;
      surveyStartedAt: string | null;
      sampleSize: number | null;
      marginOfError: number | null;
      responseRate: number | null;
      registeredAt: string;
      rates: Record<string, number>;
    };
    const byPoll = new Map<number, PointRow>();
    for (const r of responses) {
      const pid = r.poll.id;
      if (!byPoll.has(pid)) {
        byPoll.set(pid, {
          pollId: pid,
          agency: r.poll.agency,
          surveyEndedAt: r.poll.surveyEndedAt?.toISOString() ?? null,
          surveyStartedAt: r.poll.surveyStartedAt?.toISOString() ?? null,
          sampleSize: r.poll.sampleSize,
          marginOfError: r.poll.marginOfError,
          responseRate: r.poll.responseRate,
          registeredAt: r.poll.registeredAt.toISOString(),
          rates: {},
        });
      }
      const candKey = r.candidateName ?? r.partyName ?? '미식별';
      byPoll.get(pid)!.rates[candKey] = r.rate;
    }

    const points = Array.from(byPoll.values()).sort((a, b) => {
      const aTime = a.surveyEndedAt ?? a.registeredAt;
      const bTime = b.surveyEndedAt ?? b.registeredAt;
      return aTime.localeCompare(bTime);
    });

    const allAgencies = Array.from(new Set(responses.map((r) => r.poll.agency))).sort();

    const result = {
      race: {
        id: district.id,
        displayName: district.district,
        electionType: 'by-election',
        sido: district.region,
        sigungu: district.district,
      },
      candidates: district.candidates.map((c) => ({
        id: c.id,
        name: c.name,
        party: c.party,
      })),
      agencies: allAgencies,
      points,
    };

    await this.redis.set(key, result, 1800);
    return result;
  }

  /**
   * 관리자용: race 매칭이 안 된 PollResponse를 가진 Poll 목록.
   * (raceId IS NULL이고 candidateName/raceLabel은 있는 행을 가진 poll)
   */
  async pendingMappings(limit = 50, offset = 0) {
    const polls = await this.prisma.poll.findMany({
      where: {
        responses: { some: { raceId: null } },
      },
      select: {
        id: true,
        nttId: true,
        agency: true,
        client: true,
        sido: true,
        sigungu: true,
        pollName: true,
        registeredAt: true,
        responses: {
          where: { raceId: null, subgroupKey: 'total', questionType: 'candidate_support' },
          select: {
            id: true,
            candidateName: true,
            partyName: true,
            rate: true,
          },
        },
      },
      orderBy: [{ registeredAt: 'desc' }],
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.poll.count({
      where: { responses: { some: { raceId: null } } },
    });

    return {
      total,
      limit,
      offset,
      polls: polls.map((p) => ({
        id: p.id,
        nttId: p.nttId,
        agency: p.agency,
        client: p.client,
        sido: p.sido,
        sigungu: p.sigungu,
        pollName: p.pollName,
        registeredAt: p.registeredAt.toISOString(),
        unmappedResponses: p.responses,
      })),
    };
  }

  /**
   * 관리자용: Poll의 모든 unmapped 응답을 특정 race로 일괄 지정.
   * - PollRace M:N에 raceId 추가
   * - PollResponse.raceId 업데이트
   * - 후보 매칭도 시도
   */
  async assignRaceToPoll(pollId: number, raceId: number): Promise<{ updated: number }> {
    const race = await this.prisma.localElectionRace.findUnique({
      where: { id: raceId },
      select: {
        id: true,
        candidates: { select: { id: true, name: true } },
      },
    });
    if (!race) throw new Error(`Race not found: ${raceId}`);

    const candByName = new Map(race.candidates.map((c) => [c.name, c.id]));

    const unmapped = await this.prisma.pollResponse.findMany({
      where: { pollId, raceId: null },
      select: { id: true, candidateName: true },
    });

    for (const r of unmapped) {
      const candidateId =
        r.candidateName && candByName.has(r.candidateName)
          ? candByName.get(r.candidateName)!
          : null;
      await this.prisma.pollResponse.update({
        where: { id: r.id },
        data: { raceId, candidateId },
      });
    }

    await this.prisma.pollRace.upsert({
      where: { pollId_raceId: { pollId, raceId } },
      create: { pollId, raceId },
      update: {},
    });

    // 관련 캐시 무효화 시도 (실패해도 무시 — Upstash 한도 이슈 대응)
    try {
      await this.redis.del(`polls:timeseries:${raceId}:all:v1`);
      await this.redis.del(`polls:detail:${pollId}:v1`);
    } catch {
      // ignore
    }

    return { updated: unmapped.length };
  }

  /** Race 상세에서 사용: 해당 race + 같은 sido/sigungu 범위의 최근 조사 */
  async byRace(raceId: number, limit = 20) {
    const key = `polls:by-race:${raceId}:${limit}:v1`;
    const cached = await this.redis.get<unknown>(key);
    if (cached) return cached;

    const race = await this.prisma.localElectionRace.findUnique({
      where: { id: raceId },
      select: { id: true, sido: true, sigungu: true, electionType: true },
    });
    if (!race) return null;

    // 1) Race가 직접 연결된 조사 (PollRace) — Step 2에서 채워짐
    // 2) 같은 sido + (sigungu 또는 전국) 매칭 — 광범위 fallback
    const polls = await this.prisma.poll.findMany({
      where: {
        electionCategory: '제9회 전국동시지방선거',
        OR: [
          { races: { some: { raceId: race.id } } },
          {
            sido: race.sido,
            ...(race.sigungu ? { sigungu: { in: [race.sigungu, ''] } } : {}),
          },
          { sido: '전국' },
        ],
      },
      orderBy: [{ registeredAt: 'desc' }, { id: 'desc' }],
      take: limit,
      select: {
        id: true,
        nttId: true,
        registrationNo: true,
        electionCategory: true,
        pollName: true,
        agency: true,
        client: true,
        sido: true,
        sigungu: true,
        sampleSize: true,
        responseRate: true,
        marginOfError: true,
        surveyStartedAt: true,
        surveyEndedAt: true,
        registeredAt: true,
        publishedAt: true,
        surveyMethod: true,
      },
    });

    const result = polls.map(pollListItem);
    await this.redis.set(key, result, DEFAULT_TTL_SECONDS);
    return result;
  }

  /** 필터 옵션 (사이드바 드롭다운용): 시·도 + 조사기관 목록 */
  async filters() {
    const key = 'polls:filters:v1';
    const cached = await this.redis.get<unknown>(key);
    if (cached) return cached;

    const [sidos, agencies] = await Promise.all([
      this.prisma.poll.groupBy({
        by: ['sido'],
        _count: { _all: true },
        orderBy: { _count: { sido: 'desc' } },
      }),
      this.prisma.poll.groupBy({
        by: ['agency'],
        _count: { _all: true },
        orderBy: { _count: { agency: 'desc' } },
        take: 30,
      }),
    ]);

    const result = {
      sidos: sidos.map((s) => ({ value: s.sido, count: s._count._all })),
      agencies: agencies.map((a) => ({ value: a.agency, count: a._count._all })),
      categories: [
        { value: '제9회 전국동시지방선거', label: '2026 지방선거' },
        { value: '2026년 재·보궐선거', label: '2026 재보궐' },
      ],
    };
    await this.redis.set(key, result, DEFAULT_TTL_SECONDS);
    return result;
  }
}
