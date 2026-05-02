import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_BOOKMARKS = 50;

interface UpdatePreferenceData {
  displayName?: string;
  district?: string | null;
  interests?: string[];
}

@Injectable()
export class UserPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async update(userId: string, data: UpdatePreferenceData) {
    const sanitized: Record<string, unknown> = {};

    if (data.displayName !== undefined) {
      sanitized.displayName = data.displayName?.trim() || null;
    }
    if (data.district !== undefined) {
      sanitized.district = data.district === null ? null : data.district?.trim() || null;
    }
    if (data.interests !== undefined) {
      sanitized.interests = Array.isArray(data.interests)
        ? data.interests.filter((t): t is string => typeof t === 'string').map((t) => t.trim())
        : [];
    }

    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...sanitized },
      update: sanitized,
    });
  }

  async addBillBookmark(userId: string, billId: string) {
    // upsert로 레코드 보장 후, 원자적 array_append (중복/개수 제한 포함)
    await this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    await this.prisma.$executeRaw`
      UPDATE "UserPreference"
      SET "bookmarkedBills" = array_append("bookmarkedBills", ${billId}),
          "updatedAt" = now()
      WHERE "userId" = ${userId}
        AND NOT (${billId} = ANY("bookmarkedBills"))
        AND array_length("bookmarkedBills", 1) < ${MAX_BOOKMARKS}
    `;

    return this.prisma.userPreference.findUnique({ where: { userId } });
  }

  async removeBillBookmark(userId: string, billId: string) {
    await this.prisma.$executeRaw`
      UPDATE "UserPreference"
      SET "bookmarkedBills" = array_remove("bookmarkedBills", ${billId}),
          "updatedAt" = now()
      WHERE "userId" = ${userId}
    `;

    return this.prisma.userPreference.findUniqueOrThrow({ where: { userId } });
  }

  async addMemberBookmark(userId: string, memberId: string) {
    await this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    await this.prisma.$executeRaw`
      UPDATE "UserPreference"
      SET "bookmarkedMembers" = array_append("bookmarkedMembers", ${memberId}),
          "updatedAt" = now()
      WHERE "userId" = ${userId}
        AND NOT (${memberId} = ANY("bookmarkedMembers"))
        AND array_length("bookmarkedMembers", 1) < ${MAX_BOOKMARKS}
    `;

    return this.prisma.userPreference.findUnique({ where: { userId } });
  }

  async removeMemberBookmark(userId: string, memberId: string) {
    await this.prisma.$executeRaw`
      UPDATE "UserPreference"
      SET "bookmarkedMembers" = array_remove("bookmarkedMembers", ${memberId}),
          "updatedAt" = now()
      WHERE "userId" = ${userId}
    `;

    return this.prisma.userPreference.findUniqueOrThrow({ where: { userId } });
  }
}
