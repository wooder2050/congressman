/**
 * Lawmake Radar Pro 출시 알림 신청(유료 의향 측정). 로그인/비로그인 모두 허용.
 * normalizedEmail unique로 중복 신청 방지(멱등). 연락 동의(consentedAt) 함께 기록.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class UpgradeInterestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @param userId 로그인 사용자면 auth UUID, 아니면 null.
   * @param email 신청 이메일. @param source 신청 위치(예: "alerts_page").
   */
  async register(
    userId: string | null,
    email: string,
    source: string,
  ): Promise<{ ok: true; alreadyRegistered: boolean }> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      throw new BadRequestException('유효한 이메일이 아닙니다.');
    }
    const safeSource = (source || 'unknown').slice(0, 64);

    try {
      await this.prisma.upgradeInterest.create({
        data: {
          userId,
          email: normalizedEmail,
          normalizedEmail,
          source: safeSource,
          consentedAt: new Date(),
        },
      });
      return { ok: true, alreadyRegistered: false };
    } catch (e) {
      // normalizedEmail unique 충돌 → 이미 신청함(멱등 성공).
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return { ok: true, alreadyRegistered: true };
      }
      throw e;
    }
  }
}
