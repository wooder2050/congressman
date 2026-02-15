import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AbsenceDetail {
  type: '무단결석' | '청가' | '출장' | '질병';
  count: number;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(memberId: string, termId: number) {
    const record = await this.prisma.attendance.findUnique({
      where: { memberId_termId: { memberId, termId } },
    });

    if (!record) return null;

    return {
      memberId: record.memberId,
      termId: record.termId,
      totalSessions: record.totalSessions,
      attended: record.attended,
      absent: record.absent,
      leave: record.leave,
      travel: record.travel,
      rate: record.rate,
    };
  }

  async getAbsenceDetails(memberId: string, termId: number): Promise<AbsenceDetail[]> {
    const record = await this.prisma.attendance.findUnique({
      where: { memberId_termId: { memberId, termId } },
    });

    if (!record) return [];

    const details: AbsenceDetail[] = [];
    if (record.absent > 0) details.push({ type: '무단결석', count: record.absent });
    if (record.leave > 0) details.push({ type: '청가', count: record.leave });
    if (record.travel > 0) details.push({ type: '출장', count: record.travel });

    return details;
  }
}
