import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_HOUR = 60 * 60;

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
              orderBy: { candidateNumber: 'asc' },
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
        candidates: d.candidates.map((c) => ({
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
          candidateNumber: c.candidateNumber,
          status: c.status,
          memberIdRef: c.memberIdRef,
        })),
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

    // 3. 의원별 scorecard 정보 조회
    const result = [];
    for (const memberId of memberIds) {
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
        select: { id: true, name: true, photoUrl: true },
      });
      if (!member) continue;

      // MemberTerm에서 22대 정보
      const term = await this.prisma.memberTerm.findUnique({
        where: { memberId_termId: { memberId, termId: 22 } },
        include: { party: true },
      });

      // 출석률
      const attendance = await this.prisma.attendance.findUnique({
        where: { memberId_termId: { memberId, termId: 22 } },
      });

      // 법안 발의 건수
      const billCount = await this.prisma.billProposer.count({
        where: { memberId, bill: { termId: 22 }, role: 'representative' },
      });

      // 법안 가결
      const passedCount = await this.prisma.billProposer.count({
        where: {
          memberId,
          bill: { termId: 22, status: 'passed' },
          role: 'representative',
        },
      });

      // 표결 참여
      const totalVotes = await this.prisma.memberVote.count({
        where: { memberId, vote: { termId: 22 } },
      });
      const attendedVotes = await this.prisma.memberVote.count({
        where: {
          memberId,
          vote: { termId: 22 },
          result: { in: ['yes', 'no', 'abstain'] },
        },
      });

      // 재산 (최신 연도의 합산)
      const latestAssetYear = await this.prisma.asset.findFirst({
        where: { memberId },
        orderBy: { year: 'desc' },
        select: { year: true },
      });
      let totalAssetAmount: bigint | null = null;
      let assetYear: number | null = null;
      if (latestAssetYear) {
        assetYear = latestAssetYear.year;
        const sum = await this.prisma.asset.aggregate({
          where: { memberId, year: assetYear },
          _sum: { amount: true },
        });
        totalAssetAmount = sum._sum.amount;
      }

      // 출마 지역 확인
      const districtInfo =
        districts.find((d) => d.previousMemberId === memberId) ||
        candidates.find((c) => c.memberIdRef === memberId);
      const runningFor = districtInfo
        ? 'vacancyReason' in districtInfo
          ? districtInfo.district
          : (districtInfo as (typeof candidates)[number]).district?.district || ''
        : '';
      const runningReason =
        districtInfo && 'vacancyReason' in districtInfo ? districtInfo.vacancyReason : '';

      const attendanceRate = attendance
        ? Math.round(
            ((attendance.attended ?? 0) /
              Math.max((attendance.attended ?? 0) + (attendance.absent ?? 0), 1)) *
              100,
          )
        : 0;
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
        totalAsset: totalAssetAmount !== null ? Number(totalAssetAmount) : null,
        assetYear,
      });
    }

    result.sort((a, b) => b.attendanceRate - a.attendanceRate);

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }
}
