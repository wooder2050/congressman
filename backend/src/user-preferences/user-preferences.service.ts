import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_BOOKMARKS = 50;
const MAX_INTERESTS = 15;
const MAX_STRING_LENGTH = 200;

interface UpdatePreferenceDto {
  displayName?: string;
  district?: string | null;
  interests?: string[];
}

function sanitizeString(val: unknown, maxLen = MAX_STRING_LENGTH): string | undefined {
  if (typeof val !== 'string') return undefined;
  return val.slice(0, maxLen).trim();
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

  async update(userId: string, data: UpdatePreferenceDto) {
    const sanitized: Record<string, unknown> = {};

    if (data.displayName !== undefined) {
      sanitized.displayName = sanitizeString(data.displayName) ?? null;
    }
    if (data.district !== undefined) {
      sanitized.district = data.district === null ? null : (sanitizeString(data.district) ?? null);
    }
    if (data.interests !== undefined) {
      if (!Array.isArray(data.interests)) {
        sanitized.interests = [];
      } else {
        sanitized.interests = data.interests
          .filter((t): t is string => typeof t === 'string')
          .slice(0, MAX_INTERESTS)
          .map((t) => t.slice(0, MAX_STRING_LENGTH).trim());
      }
    }

    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...sanitized },
      update: sanitized,
    });
  }

  async addBillBookmark(userId: string, billId: string) {
    return this.prisma.$transaction(async (tx) => {
      const pref = await tx.userPreference.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      if (pref.bookmarkedBills.includes(billId)) return pref;
      if (pref.bookmarkedBills.length >= MAX_BOOKMARKS) return pref;

      return tx.userPreference.update({
        where: { userId },
        data: { bookmarkedBills: [...pref.bookmarkedBills, billId] },
      });
    });
  }

  async removeBillBookmark(userId: string, billId: string) {
    return this.prisma.$transaction(async (tx) => {
      const pref = await tx.userPreference.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      return tx.userPreference.update({
        where: { userId },
        data: {
          bookmarkedBills: pref.bookmarkedBills.filter((id) => id !== billId),
        },
      });
    });
  }

  async addMemberBookmark(userId: string, memberId: string) {
    return this.prisma.$transaction(async (tx) => {
      const pref = await tx.userPreference.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      if (pref.bookmarkedMembers.includes(memberId)) return pref;
      if (pref.bookmarkedMembers.length >= MAX_BOOKMARKS) return pref;

      return tx.userPreference.update({
        where: { userId },
        data: { bookmarkedMembers: [...pref.bookmarkedMembers, memberId] },
      });
    });
  }

  async removeMemberBookmark(userId: string, memberId: string) {
    return this.prisma.$transaction(async (tx) => {
      const pref = await tx.userPreference.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      return tx.userPreference.update({
        where: { userId },
        data: {
          bookmarkedMembers: pref.bookmarkedMembers.filter((id) => id !== memberId),
        },
      });
    });
  }
}
