/**
 * Lawmake Radar: 법안 변경 감지 → PolicyEvent 빌더 (순수 함수, 테스트 용이).
 *
 * bill sync의 old/new 비교에서 "의미 있는 변경"만 이벤트로 만든다.
 * - 감지 대상: 상태(status), 위원회 처리결과, 법사위 처리결과, 본회의 처리(plenary)
 * - 제외: title·proposer·날짜 단독 변경(updatedAt 포함) → 이메일 스팸 방지
 */

import { randomUUID } from 'node:crypto';

/**
 * sync 실행 식별자. PolicyEvent @@unique([runId, billId]) key.
 * ISO 시각 + UUID로, 같은 밀리초에 시작한 동시/재시도 실행이 충돌하지 않게 한다
 * (skipDuplicates가 충돌을 '성공'으로 삼켜 이벤트를 유실하는 것을 방지).
 * 한 실행 내에서는 한 번만 만들어 불변으로 쓴다.
 */
export function makeRunId(): string {
  return `${new Date().toISOString()}-${randomUUID()}`;
}

/**
 * PolicyEvent '수집'을 켤지 여부. UI/Watch 생성용 RADAR_ENABLED와 분리한다.
 * 이유: 이메일 발송(Phase 4)은 그동안 쌓인 이벤트를 보내는데, 수집이 UI flag와 함께 OFF면
 * 보낼 이벤트 자체가 없다. 그래서 수집은 UI 공개보다 먼저 켜서 데이터를 축적한다.
 * 하위호환: 기존에 RADAR_ENABLED만 켜둔 환경도 계속 수집되도록 둘 중 하나면 ON.
 */
export function isRadarEventCollectionEnabled(): boolean {
  return process.env.RADAR_EVENTS_ENABLED === 'true' || process.env.RADAR_ENABLED === 'true';
}

/** 감지에 필요한 법안 필드 스냅샷(old/new 공통). */
export interface BillSnapshot {
  status: string;
  committeeResultCode: string | null;
  committeeResultDate: string | null;
  lawResultCode: string | null;
  lawResultDate: string | null;
  plenaryDate: string | null;
}

interface PolicyChange {
  field: string;
  from: string | null;
  to: string | null;
}

export interface PolicyEventDraft {
  eventType: string; // status_change | committee_result | law_result | plenary
  changes: PolicyChange[];
  sourceChangedAt: string | null; // 원천 변경일(있으면)
}

/**
 * old→new에서 의미 있는 변경을 뽑아 PolicyEvent 초안을 만든다.
 * 변경이 없으면 null(이벤트 미생성). 여러 필드가 함께 바뀌면 하나의 이벤트에 changes로 묶는다.
 * eventType은 우선순위(본회의 > 법사위 결과 > 위원회 결과 > 상태)로 대표값을 정한다.
 */
export function buildPolicyEvent(
  oldBill: BillSnapshot,
  newBill: BillSnapshot,
): PolicyEventDraft | null {
  // old/new는 이미 effectiveNext(역행·null 치환)를 거친 값이라, 여기서는 순수 비교만 한다.
  const changes: PolicyChange[] = [];

  if (oldBill.status !== newBill.status) {
    changes.push({ field: 'status', from: oldBill.status, to: newBill.status });
  }
  if (oldBill.committeeResultCode !== newBill.committeeResultCode) {
    changes.push({
      field: 'committeeResultCode',
      from: oldBill.committeeResultCode,
      to: newBill.committeeResultCode,
    });
  }
  if (oldBill.lawResultCode !== newBill.lawResultCode) {
    changes.push({
      field: 'lawResultCode',
      from: oldBill.lawResultCode,
      to: newBill.lawResultCode,
    });
  }
  // 본회의 처리일이 '없음 → 있음'이 되면 본회의 처리 이벤트(재정정 등 값 변경은 무시).
  if (!oldBill.plenaryDate && newBill.plenaryDate) {
    changes.push({ field: 'plenaryDate', from: null, to: newBill.plenaryDate });
  }

  if (changes.length === 0) return null;

  // 대표 eventType 결정 + 원천 변경일 추정
  let eventType = 'status_change';
  let sourceChangedAt: string | null = null;
  if (changes.some((c) => c.field === 'plenaryDate')) {
    eventType = 'plenary';
    sourceChangedAt = newBill.plenaryDate;
  } else if (changes.some((c) => c.field === 'lawResultCode')) {
    eventType = 'law_result';
    sourceChangedAt = newBill.lawResultDate;
  } else if (changes.some((c) => c.field === 'committeeResultCode')) {
    eventType = 'committee_result';
    sourceChangedAt = newBill.committeeResultDate;
  }

  return { eventType, changes, sourceChangedAt };
}

/**
 * old + incoming(원천 응답) → { effective, event }.
 * - effective: effectiveNext(역행·null 치환)를 거친 '실제로 DB에 써야 할 상태/결과 필드' 값.
 *   Bill 갱신과 이벤트 감지가 반드시 같은 값을 쓰도록 한곳에서 계산(재감지 방지).
 * - event: 의미 있는 변경이 있으면 PolicyEvent 초안, 없으면 null.
 * bill sync의 세 경로(syncBills / syncBillsSafe / ExtraBillSync)가 공유한다.
 */
export function resolveBillTransition(
  oldBill: BillSnapshot,
  incoming: BillSnapshot,
): { effective: BillSnapshot; event: PolicyEventDraft | null } {
  const effective = effectiveNext(oldBill, incoming);
  return { effective, event: buildPolicyEvent(oldBill, effective) };
}

/** status 진행 순위(낮을수록 초기 단계). 역행 판정용. */
const STATUS_RANK: Record<string, number> = {
  pending: 0,
  committee: 1,
  passed: 2,
  discarded: 2, // 폐기/철회도 종결 단계(pending보다 진행). 역행 아님.
};

/**
 * 원천 응답의 '역행/누락'을 기존 값으로 치환한 '유효 다음 값'을 만든다.
 * API 일시 오류(PROC_RESULT 누락 → status가 pending으로 역행, 결과코드가 null로 사라짐)를
 * DB에도 이벤트에도 반영하지 않기 위해, 이런 필드는 기존 값을 유지한다.
 * 정상적인 전진(값 부여·상위 단계)만 새 값을 채택한다.
 */
export function effectiveNext(oldBill: BillSnapshot, incoming: BillSnapshot): BillSnapshot {
  const oldRank = STATUS_RANK[oldBill.status] ?? 0;
  const newRank = STATUS_RANK[incoming.status] ?? 0;
  const status = newRank < oldRank ? oldBill.status : incoming.status; // 역행이면 기존 유지

  // 결과코드가 '있음 → null'이면 원천 누락 가능성 → 기존 코드 유지
  const committeeResultCode = incoming.committeeResultCode ?? oldBill.committeeResultCode;
  const lawResultCode = incoming.lawResultCode ?? oldBill.lawResultCode;

  return {
    status,
    committeeResultCode,
    // 코드가 없으면 날짜도 없음. 코드가 있으면 날짜는 (누락 시) 기존 날짜 유지 → DB에서 날짜가
    // 지워지지 않도록(지우면 다음 sync에서 재감지). 비교와 DB 갱신 모두 이 값을 써야 일관.
    committeeResultDate: committeeResultCode
      ? (incoming.committeeResultDate ?? oldBill.committeeResultDate)
      : null,
    lawResultCode,
    lawResultDate: lawResultCode ? (incoming.lawResultDate ?? oldBill.lawResultDate) : null,
    // 본회의 처리일은 한 번 부여되면 유지(누락 시 기존 값)
    plenaryDate: incoming.plenaryDate ?? oldBill.plenaryDate,
  };
}
