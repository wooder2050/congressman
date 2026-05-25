import { Injectable, NotFoundException } from '@nestjs/common';
import type { Candidate, CandidateAssetItem, Party } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { pickAssetSource } from './asset-source.helper';
import { getLawmakerSummary } from './lawmaker-stats.helper';

const TTL_HOUR = 60 * 60;

/** 후보자 자산 항목 → API 응답 매핑 (BigInt → string) */
function mapAssetItem(item: CandidateAssetItem) {
  return {
    id: item.id,
    category: item.category,
    subCategory: item.subCategory,
    relation: item.relation,
    description: item.description,
    currentValue: item.currentValue !== null ? item.currentValue.toString() : null,
    previousValue: item.previousValue !== null ? item.previousValue.toString() : null,
    increaseValue: item.increaseValue !== null ? item.increaseValue.toString() : null,
    decreaseValue: item.decreaseValue !== null ? item.decreaseValue.toString() : null,
    marketPrice: item.marketPrice !== null ? item.marketPrice.toString() : null,
    changeReason: item.changeReason,
    source: item.source,
    sourceUrl: item.sourceUrl,
    sourceDate: item.sourceDate,
  };
}

/** assetItems + availableSources 묶음 빌드 (codex #2) */
function buildAssetSection(items: CandidateAssetItem[]) {
  const picked = pickAssetSource(items);
  return {
    assetItems: picked.selected.map(mapAssetItem),
    assetSelectedSource: picked.selectedSource,
    assetAvailableSources: picked.availableSources,
  };
}

/** 재보궐 후보자(Candidate) → API 응답 공통 매핑 */
function mapCandidate(c: Candidate & { party: Party | null }) {
  return {
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
    career: c.career,
    education: c.education,
    slogan: c.slogan,
    pledges: c.pledges as { category: string; title: string; description: string }[],
    assets: c.assets,
    assetDeclared: c.assetDeclared !== null ? c.assetDeclared.toString() : null,
    militaryService: c.militaryService,
    taxPaid: c.taxPaid !== null ? c.taxPaid.toString() : null,
    taxOverdue5y: c.taxOverdue5y !== null ? c.taxOverdue5y.toString() : null,
    taxOverdueCurrent: c.taxOverdueCurrent !== null ? c.taxOverdueCurrent.toString() : null,
    criminalRecord: c.criminalRecord,
    electionCount: c.electionCount,
    assetPdfUrls: c.assetPdfUrls,
    assetPagePngUrls: c.assetPagePngUrls,
    candidateNumber: c.candidateNumber,
    status: c.status,
    memberIdRef: c.memberIdRef,
  };
}

@Injectable()
export class ElectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll() {
    const key = 'elections:list';
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const elections = await this.prisma.byElection.findMany({
      include: { districts: { select: { id: true } } },
      orderBy: { electionDate: 'desc' },
    });

    const result = elections.map((e) => ({
      id: e.id,
      name: e.name,
      electionDate: e.electionDate.toISOString().split('T')[0],
      status: e.status,
      districtCount: e.districts.length,
    }));

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async findById(id: string) {
    const key = `elections:${id}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const election = await this.prisma.byElection.findUnique({
      where: { id },
      include: {
        districts: {
          orderBy: [{ confirmed: 'desc' }, { id: 'asc' }],
          include: {
            previousMember: true,
            previousParty: true,
            candidates: {
              include: { party: true },
              orderBy: [{ candidateNumber: { sort: 'asc', nulls: 'last' } }, { name: 'asc' }],
            },
          },
        },
      },
    });

    if (!election) return null;

    const result = {
      id: election.id,
      name: election.name,
      electionDate: election.electionDate.toISOString().split('T')[0],
      status: election.status,
      description: election.description,
      districts: election.districts.map((d) => ({
        id: d.id,
        district: d.district,
        region: d.region,
        vacancyReason: d.vacancyReason,
        confirmed: d.confirmed,
        status: d.status,
        previousMember: d.previousMember
          ? {
              id: d.previousMember.id,
              name: d.previousMember.name,
              photoUrl: d.previousMember.photoUrl,
              party: d.previousParty
                ? {
                    id: d.previousParty.id,
                    name: d.previousParty.name,
                    shortName: d.previousParty.shortName,
                    color: d.previousParty.color,
                  }
                : null,
            }
          : d.previousMemberName
            ? {
                id: null,
                name: d.previousMemberName,
                photoUrl: '',
                party: d.previousParty
                  ? {
                      id: d.previousParty.id,
                      name: d.previousParty.name,
                      shortName: d.previousParty.shortName,
                      color: d.previousParty.color,
                    }
                  : null,
              }
            : null,
        candidates: d.candidates.map(mapCandidate),
      })),
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getLawmakerCandidates(electionId: string) {
    const key = `elections:${electionId}:lawmaker-candidates`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    // 1. 사퇴하여 출마한 의원 (previousMember가 있고 "출마 사퇴"인 경우)
    const districts = await this.prisma.electionDistrict.findMany({
      where: {
        electionId,
        previousMemberId: { not: null },
        vacancyReason: { contains: '출마' },
      },
      include: {
        previousMember: true,
        previousParty: true,
      },
    });

    // 2. 후보자 중 memberIdRef가 있는 경우
    const candidates = await this.prisma.candidate.findMany({
      where: {
        district: { electionId },
        memberIdRef: { not: null },
      },
      include: {
        district: true,
        party: true,
      },
    });

    // 의원 ID 수집
    const memberIds = new Set<string>();
    for (const d of districts) {
      if (d.previousMemberId) memberIds.add(d.previousMemberId);
    }
    for (const c of candidates) {
      if (c.memberIdRef) memberIds.add(c.memberIdRef);
    }

    // 3. 배치 조회로 모든 의원 데이터를 한 번에 가져오기
    const ids = [...memberIds];
    if (ids.length === 0) {
      await this.redis.set(key, [], TTL_HOUR);
      return [];
    }

    const [allMembers, allTerms, allAttendance, billStats, voteStats, assetStats] =
      await Promise.all([
        // 의원 기본 정보 배치
        this.prisma.member.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, photoUrl: true },
        }),
        // 최신 MemberTerm 배치 (정당 포함)
        this.prisma.memberTerm.findMany({
          where: { memberId: { in: ids } },
          orderBy: { termId: 'desc' },
          include: { party: true },
        }),
        // 출석률 배치
        this.prisma.attendance.findMany({
          where: { memberId: { in: ids }, termId: 22 },
        }),
        // 법안 발의 통계 (대표발의 + 가결) — 단일 쿼리
        this.prisma.$queryRaw<{ memberId: string; billCount: bigint; passedCount: bigint }[]>`
          SELECT bp."memberId",
            COUNT(*)::bigint AS "billCount",
            COUNT(*) FILTER (WHERE b.status = 'passed')::bigint AS "passedCount"
          FROM "BillProposer" bp
          JOIN "Bill" b ON b.id = bp."billId"
          WHERE bp."memberId" = ANY(${ids})
            AND bp.role = 'representative'
            AND b."termId" = 22
          GROUP BY bp."memberId"
        `,
        // 표결 참여 통계 — 단일 쿼리
        this.prisma.$queryRaw<{ memberId: string; totalVotes: bigint; attendedVotes: bigint }[]>`
          SELECT mv."memberId",
            COUNT(*)::bigint AS "totalVotes",
            COUNT(*) FILTER (WHERE mv.result IN ('yes', 'no', 'abstain'))::bigint AS "attendedVotes"
          FROM "MemberVote" mv
          JOIN "Vote" v ON v.id = mv."voteId"
          WHERE mv."memberId" = ANY(${ids})
            AND v."termId" = 22
          GROUP BY mv."memberId"
        `,
        // 재산 합계 (최신 연도) — 단일 쿼리
        this.prisma.$queryRaw<{ memberId: string; year: number; total: bigint }[]>`
          SELECT a."memberId", a.year, SUM(a.amount)::bigint AS total
          FROM "Asset" a
          WHERE a."memberId" = ANY(${ids})
            AND a.year = (
              SELECT MAX(a2.year) FROM "Asset" a2 WHERE a2."memberId" = a."memberId"
            )
          GROUP BY a."memberId", a.year
        `,
      ]);

    // 인덱스 맵 생성
    const memberMap = new Map(allMembers.map((m) => [m.id, m]));
    const termMap = new Map<string, (typeof allTerms)[0]>();
    for (const t of allTerms) {
      if (!termMap.has(t.memberId)) termMap.set(t.memberId, t);
    }
    const attendanceMap = new Map(allAttendance.map((a) => [a.memberId, a]));
    const billMap = new Map(billStats.map((b) => [b.memberId, b]));
    const voteMap = new Map(voteStats.map((v) => [v.memberId, v]));
    const assetMap = new Map(assetStats.map((a) => [a.memberId, a]));

    // 결과 조립
    const result = [];
    for (const memberId of ids) {
      const member = memberMap.get(memberId);
      if (!member) continue;

      const term = termMap.get(memberId);
      const attendance = attendanceMap.get(memberId);
      const bills = billMap.get(memberId);
      const votes = voteMap.get(memberId);
      const asset = assetMap.get(memberId);

      const fromDistrict = districts.find((d) => d.previousMemberId === memberId);
      const fromCandidate = candidates.find((c) => c.memberIdRef === memberId);

      let runningFor = '';
      let runningReason = '';
      if (fromDistrict) {
        runningReason = fromDistrict.vacancyReason;
        const match = runningReason.match(
          /(\S+(?:시장|도지사|특별시장|광역시장|도지사|특별자치시장|특별자치도지사))/,
        );
        runningFor = match ? match[1] : fromDistrict.district;
      } else if (fromCandidate) {
        runningFor = fromCandidate.district?.district || '';
      }

      const attended = attendance?.attended ?? 0;
      const absent = attendance?.absent ?? 0;
      const attendanceRate = Math.round((attended / Math.max(attended + absent, 1)) * 100);
      const billCount = Number(bills?.billCount ?? 0n);
      const passedCount = Number(bills?.passedCount ?? 0n);
      const totalVotes = Number(votes?.totalVotes ?? 0n);
      const attendedVotes = Number(votes?.attendedVotes ?? 0n);
      const voteRate = totalVotes > 0 ? Math.round((attendedVotes / totalVotes) * 100) : 0;
      const passRate = billCount > 0 ? Math.round((passedCount / billCount) * 100) : 0;

      result.push({
        memberId: member.id,
        name: member.name,
        photoUrl: member.photoUrl,
        party: term?.party
          ? {
              id: term.party.id,
              name: term.party.name,
              shortName: term.party.shortName,
              color: term.party.color,
            }
          : null,
        district: term?.district || '',
        runningFor,
        runningReason,
        attendanceRate,
        voteParticipationRate: voteRate,
        billCount,
        passedCount,
        passRate,
        totalAsset: asset ? Number(asset.total) : null,
        assetYear: asset?.year ?? null,
      });
    }

    result.sort((a, b) => b.attendanceRate - a.attendanceRate);

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  /** 재보궐 후보자 단건 상세 — 후보자 상세 페이지용 */
  async getCandidateDetail(electionId: string, candidateId: number) {
    const key = `elections:${electionId}:candidate:${candidateId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, district: { electionId } },
      include: {
        party: true,
        district: true,
        assetItems: {
          orderBy: [{ category: 'asc' }, { relation: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const member = candidate.memberIdRef
      ? await getLawmakerSummary(this.prisma, candidate.memberIdRef)
      : null;

    const result = {
      ...mapCandidate(candidate),
      district: {
        id: candidate.district.id,
        district: candidate.district.district,
        region: candidate.district.region,
        vacancyReason: candidate.district.vacancyReason,
      },
      member,
      ...buildAssetSection(candidate.assetItems),
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }
}
