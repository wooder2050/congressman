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
          where: { confirmed: true },
          orderBy: { id: 'asc' },
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
}
