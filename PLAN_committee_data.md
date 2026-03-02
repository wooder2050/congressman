# 위원회 데이터 확장 계획

> AI 법안 요약 배치 작업 완료 후 착수
> 작성일: 2026-03-01

---

## 배경

현재 lawmake.kr은 **본회의** 중심 데이터만 제공 중:
- 본회의 표결 (1,225건/22대)
- 본회의 출석률 (MemberVote 기반 계산)
- 법안 목록 (위원회 배정 정보만 표시)
- 위원회 일정 (1,522건, 안건 포함)

하지만 국회 입법 활동의 **실질적 심사는 위원회에서** 일어남:
- 법안의 95%+ 이상이 위원회 단계에서 운명 결정
- 본회의는 위원회 통과 법안의 최종 확인 절차에 가까움
- 시민이 의원 활동을 제대로 평가하려면 위원회 활동이 필수

---

## 목표

1. **법안 심사 경과 추적** — 법안이 위원회→법사위→본회의를 거치는 과정 시각화
2. **위원회별 활동 현황** — 위원회별 처리 법안 통계
3. **회의록 연동** — 위원회 회의록 열람 링크 제공
4. **의원별 위원회 활동** — 소속 위원회에서의 활동 요약

---

## Phase A: 법안 심사 경과 (우선순위 1)

법안 하나의 생애주기를 보여주는 기능. 사용자 임팩트 가장 큼.

### A-1. 데이터 수집

**API 엔드포인트:**

| API | 설명 | 예상 데이터량 |
|-----|------|--------------|
| `BILLJUDGE` | 법안 심사 경과 (위원회 회부→상정→심사→결과) | 32,932건/22대 |
| `BILLJUDGECONF` | 위원회 심사 회의 정보 (의안 ID 필수) | 의안별 조회 |
| `BILLLWJUDGECONF` | 법사위 체계자구심사 회의 정보 | 의안별 조회 |

**수집 전략:**
- `BILLJUDGE`는 `fetchAll()`로 전체 수집 (대수별)
- `BILLJUDGECONF`/`BILLLWJUDGECONF`는 필요 시 개별 조회 (법안 상세 페이지 접근 시)

**작업 항목:**
1. API 응답 필드 확인 (API 정상화 후 샘플 호출)
2. `BillJudgeSyncService` 구현 — BILLJUDGE 데이터 수집
3. DB 스키마 확장 — `BillJudge` 모델 추가 또는 Bill 모델에 필드 추가

### A-2. DB 스키마 (초안)

```prisma
// 옵션 1: Bill 모델에 필드 추가 (단순)
model Bill {
  // 기존 필드 ...
  committeeDate     String?  // 위원회 회부일
  committeeResult   String?  // 위원회 처리결과 (원안가결/수정가결/폐기 등)
  committeeResultDt String?  // 위원회 처리일
  lawCommitteeResult   String?  // 법사위 처리결과
  lawCommitteeResultDt String?  // 법사위 처리일
  plenaryResult     String?  // 본회의 처리결과
  plenaryResultDt   String?  // 본회의 처리일
}

// 옵션 2: 별도 모델 (상세한 경과 추적, 여러 단계 기록 가능)
model BillProgress {
  id         Int    @id @default(autoincrement())
  billId     String
  stage      String // "committee_referral", "committee_review", "subcommittee", "law_committee", "plenary"
  result     String? // 처리결과
  date       String? // 처리일
  committee  String? // 위원회명

  bill Bill @relation(fields: [billId], references: [id])

  @@unique([billId, stage])
  @@index([billId])
}
```

**결정 기준:** BILLJUDGE API 응답 필드를 확인 후 결정. 데이터가 단순하면 옵션 1, 여러 단계가 있으면 옵션 2.

### A-3. 프론트엔드

**법안 상세 페이지 — 심사 경과 타임라인:**

```
발의 ─── 위원회 회부 ─── 위원회 심사 ─── 법사위 ─── 본회의
 ●          ●              ●            ○          ○
2024.05.30  2024.06.11    심사 중       미회부       -
```

- 현재 단계를 시각적으로 강조
- 각 단계 클릭 시 상세 정보 표시 (날짜, 결과, 관련 회의)
- 기존 법안 상세 페이지(`/bills/[id]`)에 섹션 추가

### A-4. 기존 데이터 활용

현재 Bill 모델의 `nzmimeepazxkubdpn` API에서 이미 수집 중인 필드:
- `COMMITTEE` → `bill.committee`
- `CMT_PROC_RESULT_CD` — 현재 **수집하지 않음** → daily sync에서 추가 수집
- `CMT_PROC_DT` — 현재 **수집하지 않음** → 추가 수집

**즉시 할 수 있는 것:** bill-sync.service.ts 수정으로 위원회 처리결과/처리일 수집 시작.

---

## Phase B: 위원회별 통계 (우선순위 2)

### B-1. 데이터 수집

| API | 설명 | 데이터량 |
|-----|------|---------|
| `BILLCNTCMIT` | 위원회별 의안 처리 통계 | 22건/22대 |
| `BILLCNTLAWCMIT` | 위원회별 법률안 통계 | 21건/22대 |
| `nxtkyptyaolzcbfwl` | 위원회안·대안 | 17건/22대 |

소량 데이터라 daily sync에 포함하거나, 별도 통계 API 호출로 처리.

### B-2. 프론트엔드

**새 페이지: `/committees` (위원회 목록)**

```
국회 상임위원회 현황

┌─────────────────────────────────────────┐
│ 국토교통위원회                           │
│ 접수 법안: 1,234건 | 처리: 56건          │
│ 위원장: ○○○ (□□당)                      │
│ 위원: 15명                               │
│ 다음 회의: 2026.03.05 10:00              │
└─────────────────────────────────────────┘
```

- 위원회별 법안 접수/처리 건수
- 소속 위원 목록 (committeeHistory 데이터 활용)
- 다가오는 위원회 일정 (Schedule 데이터 활용)

**의원 상세 페이지 — 위원회 활동 섹션 추가:**

- 소속 위원회 이력 (이미 `committeeHistory` 데이터 있음)
- 해당 위원회에서 처리된 법안 중 의원이 발의한 법안

---

## Phase C: 회의록 연동 (우선순위 3)

### C-1. 데이터 소스

| 방법 | 설명 | 비고 |
|------|------|------|
| 열린국회 회의록 API | 위원회 회의록 정보 (코드명 확인 필요) | API KEY 필요 |
| `ProceedingInfoService` | 공공데이터포털 회의록 API | data.go.kr 인증 |
| `record.assembly.go.kr` 크롤링 | 회의록 시스템 직접 크롤링 | 출석자, 안건, 발언 포함 |

### C-2. 최소 구현 (링크 제공)

전체 회의록을 수집하지 않더라도, 기존 Schedule 데이터의 `linkUrl`을 활용하여:
- 위원회 일정에서 "회의록 보기" 링크 제공 (이미 구현됨)
- 법안 심사 경과에서 관련 회의록 링크 연결

### C-3. 확장 구현 (출석 데이터 수집)

`ProceedingInfoService`의 출석자 정보 또는 `record.assembly.go.kr` 크롤링으로:
- 위원회 회의별 출석 의원 목록 수집
- 의원별 위원회 출석률 계산
- 의원 상세 페이지에 "위원회 출석률" 추가

**주의:** 크롤링 기반이므로 안정성/유지보수 비용 고려 필요.

---

## 구현 순서 & 의존성

```
[API 정상화 확인] ← 전제 조건
       │
       ├── Phase A-4: bill-sync에 CMT_PROC 필드 추가 수집 (즉시)
       │
       ├── Phase A-1: BILLJUDGE API 응답 필드 확인
       │      │
       │      ├── Phase A-2: DB 스키마 설계 확정
       │      │      │
       │      │      └── Phase A-3: 법안 심사 경과 타임라인 UI
       │      │
       │      └── BillJudgeSyncService 구현 + daily sync 연동
       │
       ├── Phase B-1: 위원회 통계 API 수집
       │      │
       │      └── Phase B-2: /committees 페이지 + 의원 상세 위원회 섹션
       │
       └── Phase C: 회의록 연동 (B 이후)
```

---

## 작업 체크리스트

### 사전 작업
- [ ] 국회 API 정상화 확인 (`open.assembly.go.kr` 400 에러 해소)
- [ ] `OPENSRVAPI` 호출하여 전체 API 목록에서 위원회 관련 엔드포인트 코드명 확보
- [ ] `BILLJUDGE`, `BILLJUDGECONF` 등 핵심 API 응답 필드 확인 (샘플 호출)

### Phase A: 법안 심사 경과
- [x] `bill-sync.service.ts` 수정 — `CMT_PROC_RESULT_CD`, `CMT_PROC_DT` 필드 추가 수집
- [x] Bill 모델 마이그레이션 (위원회/법사위/본회의 처리결과 필드)
- [x] `BillJudgeSyncService` 구현 (BILLJUDGE API)
- [x] sync-daily.ts에 bill-judge 태스크 추가
- [x] 백엔드 법안 상세 API 응답에 심사 경과 포함
- [x] 프론트엔드 법안 상세 페이지 심사 경과 타임라인 UI
- [x] 캐시 무효화 키 추가

### Phase B: 위원회별 통계
- [x] 위원회 통계 API 수집 서비스 구현 — 기존 Bill/MemberTerm/Schedule 데이터 집계로 대체 (BILLCNTCMIT 별도 수집 불필요)
- [x] 위원회 목록/통계 DB 모델 검토 — 기존 데이터 활용 (별도 모델 불필요)
- [x] 백엔드 위원회 API 엔드포인트 (`GET /api/committees`)
- [x] 프론트엔드 `/committees` 페이지
- [x] 의원 상세 페이지 위원회 활동 섹션 — CommitteeTab.tsx로 기존 구현 완료

### Phase C: 회의록 연동
- [ ] 회의록 API 코드명 확인 및 데이터 구조 파악
- [ ] ProceedingInfoService (data.go.kr) API 키 발급 및 테스트
- [ ] 위원회 출석 데이터 수집 방식 결정 (API vs 크롤링)
- [ ] 의원별 위원회 출석률 계산 로직
- [ ] 프론트엔드 위원회 출석률 UI

---

## 참고: 현재 위원회 관련 인프라

### 이미 있는 것
| 항목 | 위치 | 설명 |
|------|------|------|
| 위원회 일정 | Schedule 모델 | type="committee", 1,522건 |
| 위원회 구성원 | MemberTerm.committees | 현재 소속 위원회 목록 |
| 위원회 이력 | MemberTerm.committeeHistory | [{name, startDate, endDate}] JSON |
| 위원회 역할 | MemberTerm.committeeRole | "위원장", "간사", "위원" |
| 법안 배정 위원회 | Bill.committee | 위원회명 |
| 위원회 동기화 | CommitteeSyncService | assembly.go.kr 크롤링 |
| 위원회 일정 API | nrsldhjpaemrmolla | 열린국회 API |

### 새로 수집할 것
| 항목 | API | 설명 |
|------|-----|------|
| 법안 심사 경과 | BILLJUDGE (32,932건) | 위원회/법사위/본회의 단계별 경과 |
| 위원회 심사 회의 | BILLJUDGECONF | 특정 법안의 위원회 심사 회의 정보 |
| 법사위 심사 회의 | BILLLWJUDGECONF | 법사위 체계자구심사 |
| 위원회별 통계 | BILLCNTCMIT (22건) | 위원회별 의안 처리 통계 |
| 위원회별 법률안 | BILLCNTLAWCMIT (21건) | 위원회별 법률안 통계 |
| 위원회 처리결과 | CMT_PROC_RESULT_CD | bill-sync에서 추가 수집 |
| 회의록 출석자 | ProceedingInfoService 또는 크롤링 | 위원회 출석 데이터 |
