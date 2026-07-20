/**
 * Lawmake Radar 주간 다이제스트 빌드 순수 로직(테스트 용이).
 *
 * - 기간 경계: DigestRun 커서(마지막 READY의 periodEnd)부터 이번 cutoff까지.
 * - 매칭: 사용자 활성 Watch × 기간 내 PolicyEvent를, "Watch 생성 이후" 조건으로 사용자별 묶음.
 *
 * DB·이메일·외부 호출은 여기 없다. 배치 서비스가 이 결과로 Digest/DigestItem을 만든다.
 */

/** 감지된 이벤트(매칭 입력). detectedAt으로 기간·Watch시점 비교. */
export interface EventInput {
  id: string;
  billId: string;
  eventType: string;
  changes: unknown; // [{ field, from, to }]
  detectedAt: Date;
  sourceChangedAt: string | null;
  billTitle: string;
  billStatus: string;
}

/** 활성 Watch(매칭 입력). createdAt 이후 이벤트만 포함. */
export interface WatchInput {
  id: string;
  userId: string;
  billId: string;
  createdAt: Date;
}

/** 한 사용자에게 보낼 다이제스트 항목 1건. */
export interface DigestLineItem {
  policyEventId: string;
  watchId: string;
  billId: string;
  billTitle: string;
  billStatus: string;
  eventType: string;
  changes: unknown;
  detectedAt: Date;
  sourceChangedAt: string | null;
}

/** 사용자별 묶음 결과. items가 비면 그 사용자는 발송 대상이 아니다. */
export interface UserDigest {
  userId: string;
  items: DigestLineItem[];
}

/**
 * 이번 실행의 기간 [periodStart, periodEnd)을 정한다.
 * - periodEnd: 이번 cutoff(주간 배치 기준 시각).
 * - periodStart: 마지막으로 READY된 DigestRun의 periodEnd. 없으면 cutoff - 7일(최초 실행).
 * 배치가 한 주 누락되면 lastReadyPeriodEnd가 그대로라 다음 실행이 그 기간까지 자동 커버한다.
 */
export function resolvePeriod(
  cutoff: Date,
  lastReadyPeriodEnd: Date | null,
): { periodStart: Date; periodEnd: Date } {
  const periodEnd = cutoff;
  const periodStart = lastReadyPeriodEnd ?? new Date(cutoff.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { periodStart, periodEnd };
}

/** 기간 식별 키(예: "2026-W30"). 같은 기간 중복 실행 방지용 DigestRun.periodKey. */
export function periodKeyOf(periodEnd: Date): string {
  // periodEnd(이번 cutoff)의 ISO week를 키로 삼는다. UTC 기준.
  const d = new Date(
    Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth(), periodEnd.getUTCDate()),
  );
  // ISO week: 목요일이 속한 해·주차
  const day = d.getUTCDay() || 7; // 월=1..일=7
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * 활성 Watch와 기간 내 이벤트를 사용자별로 매칭한다.
 * 규칙:
 * - 이벤트는 [periodStart, periodEnd) 안에 detectedAt이 있어야 한다(호출측이 이미 필터했어도 방어).
 * - 이벤트 detectedAt >= 해당 Watch.createdAt (알림 생성 이전 변화는 제외).
 * - 같은 사용자에게 같은 PolicyEvent는 한 번만(여러 Watch가 같은 bill이어도 dedup — 실제론 unique).
 * items가 있는 사용자만 반환한다(변경 없는 사용자는 이메일 미발송).
 */
export function matchEventsToUsers(
  watches: WatchInput[],
  events: EventInput[],
  periodStart: Date,
  periodEnd: Date,
): UserDigest[] {
  // billId → 활성 Watch 목록
  const watchesByBill = new Map<string, WatchInput[]>();
  for (const w of watches) {
    const list = watchesByBill.get(w.billId);
    if (list) list.push(w);
    else watchesByBill.set(w.billId, [w]);
  }

  // userId → (policyEventId → item) : 사용자별 이벤트 dedup
  const byUser = new Map<string, Map<string, DigestLineItem>>();

  for (const e of events) {
    if (e.detectedAt < periodStart || e.detectedAt >= periodEnd) continue;
    const billWatches = watchesByBill.get(e.billId);
    if (!billWatches) continue;

    for (const w of billWatches) {
      if (e.detectedAt < w.createdAt) continue; // Watch 생성 이전 변화 제외

      let userItems = byUser.get(w.userId);
      if (!userItems) {
        userItems = new Map();
        byUser.set(w.userId, userItems);
      }
      if (userItems.has(e.id)) continue; // 같은 사용자·같은 이벤트 중복 방지

      userItems.set(e.id, {
        policyEventId: e.id,
        watchId: w.id,
        billId: e.billId,
        billTitle: e.billTitle,
        billStatus: e.billStatus,
        eventType: e.eventType,
        changes: e.changes,
        detectedAt: e.detectedAt,
        sourceChangedAt: e.sourceChangedAt,
      });
    }
  }

  const result: UserDigest[] = [];
  for (const [userId, items] of byUser) {
    if (items.size === 0) continue;
    // 항목 순서: detectedAt 오름차순, 동률이면 policyEventId로 안정 정렬
    const sorted = [...items.values()].sort((a, b) => {
      const t = a.detectedAt.getTime() - b.detectedAt.getTime();
      return t !== 0 ? t : a.policyEventId < b.policyEventId ? -1 : 1;
    });
    result.push({ userId, items: sorted });
  }
  // 사용자 순서도 안정적으로(userId 정렬) — 커서 재개·테스트 재현성
  result.sort((a, b) => (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0));
  return result;
}
