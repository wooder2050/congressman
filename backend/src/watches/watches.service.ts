import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Lawmake Radar: 법안 변경 알림(Watch) 서비스.
 *
 * - userId는 Supabase auth.users UUID(FK 없음). 컨트롤러에서 req.user.id로만 전달받는다.
 * - 생성은 멱등적: 같은 (userId, billId)를 다시 요청해도 중복 레코드를 만들지 않고,
 *   비활성(enabled=false) 상태였다면 재활성화한다.
 * - 해제는 물리삭제 대신 enabled=false (이탈 분석·재활성화).
 */
@Injectable()
export class WatchesService {
  constructor(private readonly prisma: PrismaService) {}

  /** 로그인 사용자의 알림 목록(활성 우선, 최신순). */
  async list(userId: string) {
    const watches = await this.prisma.watch.findMany({
      where: { userId },
      include: {
        bill: { select: { id: true, title: true, status: true, proposedDate: true } },
      },
      orderBy: [{ enabled: 'desc' }, { updatedAt: 'desc' }],
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
   * 법안이 실제 존재하는지 검증한다.
   */
  async create(userId: string, billId: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      select: { id: true },
    });
    if (!bill) throw new NotFoundException('존재하지 않는 법안입니다.');

    const watch = await this.prisma.watch.upsert({
      where: { userId_billId: { userId, billId } },
      create: { userId, billId, enabled: true },
      update: { enabled: true }, // 재요청·재활성화 시 활성화만
    });
    return { id: watch.id, billId: watch.billId, enabled: watch.enabled };
  }

  /**
   * 알림 해제(enabled=false). 소유권 확인 후 처리.
   * 다른 사용자의 Watch는 조회·수정 불가(404로 존재 자체를 숨김).
   */
  async disable(userId: string, watchId: string) {
    const watch = await this.prisma.watch.findUnique({ where: { id: watchId } });
    if (!watch) throw new NotFoundException('알림을 찾을 수 없습니다.');
    if (watch.userId !== userId) throw new ForbiddenException('권한이 없습니다.');

    await this.prisma.watch.update({
      where: { id: watchId },
      data: { enabled: false },
    });
    return { id: watchId, enabled: false };
  }
}
