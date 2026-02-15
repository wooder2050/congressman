import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTerm(termId: number) {
    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { termId },
      include: { member: true, party: true },
    });

    return memberTerms.map((mt) => ({
      id: mt.member.id,
      name: mt.member.name,
      photoUrl: mt.member.photoUrl,
      birthDate: mt.member.birthDate,
      electedCount: mt.member.electedCount,
      term: {
        memberId: mt.memberId,
        termId: mt.termId,
        party: {
          id: mt.party.id,
          name: mt.party.name,
          shortName: mt.party.shortName,
          color: mt.party.color,
        },
        district: mt.district,
        proportional: mt.proportional,
        committees: mt.committees,
      },
    }));
  }

  async findById(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) return null;

    return {
      id: member.id,
      name: member.name,
      photoUrl: member.photoUrl,
      birthDate: member.birthDate,
      electedCount: member.electedCount,
    };
  }

  async findTermsByMemberId(memberId: string) {
    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { memberId },
      include: { party: true },
      orderBy: { termId: 'desc' },
    });

    return memberTerms.map((mt) => ({
      memberId: mt.memberId,
      termId: mt.termId,
      party: {
        id: mt.party.id,
        name: mt.party.name,
        shortName: mt.party.shortName,
        color: mt.party.color,
      },
      district: mt.district,
      proportional: mt.proportional,
      committees: mt.committees,
    }));
  }

  async getHistory(memberId: string) {
    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { memberId },
      include: { term: true },
      orderBy: { termId: 'desc' },
    });

    return Promise.all(
      memberTerms.map(async (mt) => {
        const attendance = await this.prisma.attendance.findUnique({
          where: { memberId_termId: { memberId, termId: mt.termId } },
        });

        const billsProposed = await this.prisma.billProposer.count({
          where: {
            memberId,
            bill: { termId: mt.termId },
          },
        });

        const billsPassed = await this.prisma.billProposer.count({
          where: {
            memberId,
            bill: { termId: mt.termId, status: 'passed' },
          },
        });

        return {
          termId: mt.termId,
          termName: mt.term.name,
          attendanceRate: attendance?.rate ?? 0,
          billsProposed,
          billsPassed,
        };
      }),
    );
  }
}
