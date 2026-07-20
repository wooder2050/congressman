/**
 * Lawmake Radar 이메일 링크 처리(클릭 리다이렉트·수신거부). 로그인 없이 서명 토큰으로.
 *
 * - 클릭: 토큰(click, DigestItem.id) 검증 → clickedAt 1회 기록 → 법안 상세로 302.
 *   목적 URL은 토큰이 아니라 DB(DigestItem→billId)로 구성(open redirect 방지).
 * - 수신거부: 토큰(unsubscribe, Digest.id) 검증 → 그 Digest의 userId를 찾아
 *   UserPreference.radarEmailOptIn=false (Watch는 유지). GET은 확인만, POST가 실제 처리.
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { verifyLinkToken } from './link-token';

@Injectable()
export class DigestLinksService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly secret = process.env.RADAR_LINK_SECRET ?? '';
  private readonly siteUrl = (process.env.RADAR_SITE_URL ?? 'https://www.lawmake.kr').replace(
    /\/$/,
    '',
  );

  private verify(token: string, purpose: 'click' | 'unsubscribe'): string {
    if (this.secret.length < 16) {
      // 시크릿 미설정이면 어떤 토큰도 신뢰하지 않는다.
      throw new BadRequestException('링크 처리가 비활성화되어 있습니다.');
    }
    const r = verifyLinkToken(this.secret, token, purpose);
    if (!r.ok) throw new BadRequestException('유효하지 않거나 만료된 링크입니다.');
    return r.opaqueId;
  }

  /**
   * 클릭 처리 → 리다이렉트할 법안 상세 URL 반환.
   * clickedAt은 최초 1회만 기록(스캐너·재클릭에도 안전). 목적 URL은 서버가 구성.
   */
  async handleClick(token: string): Promise<string> {
    const itemId = this.verify(token, 'click');
    const item = await this.prisma.digestItem.findUnique({
      where: { id: itemId },
      select: { id: true, clickedAt: true, policyEvent: { select: { billId: true } } },
    });
    // 토큰은 유효하지만 항목이 없으면(삭제 등) 관리 화면으로.
    if (!item) return `${this.siteUrl}/alerts`;

    if (!item.clickedAt) {
      await this.prisma.digestItem.update({
        where: { id: item.id },
        data: { clickedAt: new Date() },
      });
    }

    const billId = item.policyEvent?.billId;
    return billId
      ? `${this.siteUrl}/bills/${encodeURIComponent(billId)}`
      : `${this.siteUrl}/alerts`;
  }

  /** 수신거부 토큰이 가리키는 Digest의 소유자 userId를 확인(확인 화면용). */
  async resolveUnsubscribe(token: string): Promise<{ digestId: string }> {
    const digestId = this.verify(token, 'unsubscribe');
    const digest = await this.prisma.digest.findUnique({
      where: { id: digestId },
      select: { id: true },
    });
    if (!digest) throw new NotFoundException('대상을 찾을 수 없습니다.');
    return { digestId: digest.id };
  }

  /** 수신거부 실행: 그 Digest 소유자의 radarEmailOptIn=false. 멱등. */
  async applyUnsubscribe(token: string): Promise<{ ok: true }> {
    const digestId = this.verify(token, 'unsubscribe');
    const digest = await this.prisma.digest.findUnique({
      where: { id: digestId },
      select: { userId: true },
    });
    if (!digest) throw new NotFoundException('대상을 찾을 수 없습니다.');

    // UserPreference가 없을 수도 있으니 upsert.
    await this.prisma.userPreference.upsert({
      where: { userId: digest.userId },
      update: { radarEmailOptIn: false },
      create: { userId: digest.userId, radarEmailOptIn: false },
    });
    return { ok: true };
  }
}
