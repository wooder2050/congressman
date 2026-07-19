/**
 * Lawmake Radar: 법안 변경 감지 → PolicyEvent 빌더 (순수 함수, 테스트 용이).
 *
 * bill sync의 old/new 비교에서 "의미 있는 변경"만 이벤트로 만든다.
 * - 감지 대상: 상태(status), 위원회 처리결과, 법사위 처리결과, 본회의 처리(plenary)
 * - 제외: title·proposer·날짜 단독 변경(updatedAt 포함) → 이메일 스팸 방지
 */

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

interface PolicyEventDraft {
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
  const changes: PolicyChange[] = [];

  // status 변경. 단 이미 처리단계에 도달한 법안이 'pending'으로 역행하는 것은 API 일시 오류
  // (PROC_RESULT 누락 → mapStatus 기본값 pending)일 가능성이 높으므로 이벤트로 만들지 않는다.
  const regressedToPending = newBill.status === 'pending' && oldBill.status !== 'pending';
  if (oldBill.status !== newBill.status && !regressedToPending) {
    changes.push({ field: 'status', from: oldBill.status, to: newBill.status });
  }
  // 결과코드도 '있음 → 없음(null)'은 원천 누락 가능성이 높아 제외(값 변경·신규 부여만 감지).
  if (
    oldBill.committeeResultCode !== newBill.committeeResultCode &&
    newBill.committeeResultCode !== null
  ) {
    changes.push({
      field: 'committeeResultCode',
      from: oldBill.committeeResultCode,
      to: newBill.committeeResultCode,
    });
  }
  if (oldBill.lawResultCode !== newBill.lawResultCode && newBill.lawResultCode !== null) {
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
