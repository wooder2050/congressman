import { PrismaClient } from '@prisma/client';

export class SyncLogService {
  constructor(private readonly prisma: PrismaClient) {}

  async start(syncType: string, termId?: number) {
    return this.prisma.syncLog.create({
      data: { syncType, termId, status: 'started' },
    });
  }

  async complete(id: number, recordCount: number) {
    return this.prisma.syncLog.update({
      where: { id },
      data: { status: 'completed', recordCount, completedAt: new Date() },
    });
  }

  async fail(id: number, errorMsg: string) {
    return this.prisma.syncLog.update({
      where: { id },
      data: { status: 'failed', errorMsg, completedAt: new Date() },
    });
  }
}
