import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** 사용자당 활성 Watch 상한(남용·비용 방어). */
const MAX_ACTIVE_WATCHES = 50;

/** 백엔드 Radar 활성화 flag. 프론트 flag와 별개로 서버도 게이팅(OFF면 생성 차단). */
function radarEnabled(): boolean {
  return process.env.RADAR_ENABLED === 'true';
}

/**
 * Lawmake Radar: 법안 변경 알림(Watch) 서비스.
 *
 * - userId는 Supabase auth.users UUID(FK 없음). 컨트롤러에서 req.user.id로만 전달받는다.
 * - 생성은 멱등적: 같은 (userId, billId)를 다시 요청해도 중복 레코드를 만들지 않고,
 *   비활성(enabled=false) 상태였다면 재활성화한다.
 * - 해제는 물리삭제 대신 enabled=false (이탈 분석·재활성화).
 * - RADAR_ENABLED가 아니면 생성 자체를 막아 프론트 flag OFF와 서버가 일치하게 한다.
 */
@Injectable()
export class WatchesService {
  constructor(private readonly prisma: PrismaService) {}

  /** 로그인 사용자의 알림 목록(활성 우선, 최신순). 활성 상한이 있어 목록 크기는 유한. */
  async list(userId: string) {
    const watches = await this.prisma.watch.findMany({
      where: { userId },
      include: {
        bill: { select: { id: true, title: true, status: true, proposedDate: true } },
      },
      orderBy: [{ enabled: 'desc' }, { updatedAt: 'desc' }],
      take: 200, // 방어적 상한(활성 50 + 과거 해제분). 초과분은 UI에 불필요.
    });
    return watches.map((w) => ({
      id: w.id,
      billId: w.billId,
      enabled: w.enabled,
      createdAt: w.createdAt,
      bill: w.bill,
    }));
  }

  /**
   * 법안 알림 생성(또는 비활성 알림 재활성화). 멱등적.
   * 법안 존재 검증 + 활성 상한 확인. RADAR OFF면 차단.
   */
  async create(userId: string, billId: string) {
    if (!radarEnabled()) {
      throw new ForbiddenException('현재 이용할 수 없는 기능입니다.');
    }

    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      select: { id: true },
    });
    if (!bill) throw new NotFoundException('존재하지 않는 법안입니다.');

    // 새로 활성화되는 경우에만 상한을 검사(이미 이 법안이 활성이면 멱등 통과).
    const existing = await this.prisma.watch.findUnique({
      where: { userId_billId: { userId, billId } },
      select: { enabled: true },
    });
    if (!existing?.enabled) {
      const activeCount = await this.prisma.watch.count({ where: { userId, enabled: true } });
      if (activeCount >= MAX_ACTIVE_WATCHES) {
        throw new ForbiddenException(
          `알림은 최대 ${MAX_ACTIVE_WATCHES}개까지 설정할 수 있습니다. 사용하지 않는 알림을 해제해 주세요.`,
        );
      }
    }

    try {
      const watch = await this.prisma.watch.upsert({
        where: { userId_billId: { userId, billId } },
        create: { userId, billId, enabled: true },
        update: { enabled: true }, // 재요청·재활성화 시 활성화만
      });
      return { id: watch.id, billId: watch.billId, enabled: watch.enabled };
    } catch (e) {
      // 검증과 upsert 사이 법안이 삭제된 경우(FK 위반) → 500 대신 404
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new NotFoundException('존재하지 않는 법안입니다.');
      }
      throw e;
    }
  }

  /**
   * 알림 해제(enabled=false). 소유권 확인 후 처리.
   * 다른 사용자의 Watch나 없는 Watch 모두 404로 응답해 존재 여부를 숨긴다.
   */
  async disable(userId: string, watchId: string) {
    const watch = await this.prisma.watch.findUnique({ where: { id: watchId } });
    // 존재하지 않거나 타인 소유면 동일하게 404(존재 노출 방지)
    if (!watch || watch.userId !== userId) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    await this.prisma.watch.update({
      where: { id: watchId },
      data: { enabled: false },
    });
    return { id: watchId, enabled: false };
  }
}
