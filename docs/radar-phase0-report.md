# Lawmake Radar — Phase 0 구현 전 확인 보고서

> 원 계획서: `~/Documents/New project 2/LAWMAKE_RADAR_EXECUTION_PLAN.md`
> 이 문서는 Phase 0(구현 전 확인) 결과 + codex(gpt-5.6-sol) 설계 논의 결론. 작성 2026-07-19.

## 1. 코드 확인 결과 (계획 가정 = 실제 코드)

| 항목 | 결과 | 활용 |
|---|---|---|
| 인증 | `SupabaseAuthGuard` + `@Req() req:{user:{id}}` → `req.user.id` | Watch API 재사용 |
| Bill 키/상태 | `id @id`(BILL_ID), `status`, `committeeResultCode`, `lawResultCode`, `updatedAt` | targetId·감지대상 |
| **sync diff** | `BillSyncService.batchUpsertBills`에 이미 old/new 필드 비교 존재 | PolicyEvent를 그 if 블록에 얹음 |
| GA | `frontend/src/lib/analytics.ts` `trackEvent()` + 중복방지 트래커 | CTA 이벤트 |
| 스케줄 | `.github/workflows/sync-{daily,weekly}.yml` cron 주석, `workflow_dispatch`만 | 완전 수동 → 자동화 필요 |
| User 모델 | **없음**. userId는 auth.users UUID를 String으로 FK 없이 관리 | Watch도 String userId |
| 이메일 | 라이브러리 없음 | Resend 신규 도입 |

## 2. 최종 스키마 (계획서 초안 → codex 수정 반영)

핵심 수정: User relation 제거(String userId), targetType 미도입(billId 명시), Digest.recipientEmail 스냅샷, DigestItem.userId 중복저장, PolicyEvent.runId.

- **Watch**: `id String @id`, `userId String`, `billId String`(Bill FK), `enabled Boolean`, timestamps. `@@unique([userId, billId])`. 사용자 FK 없음.
- **PolicyEvent**: `id String`, `billId String`(Bill FK), `runId String`, `eventType`, `changes Json`, `detectedAt`, `sourceChangedAt?`. `@@unique([runId, billId])`.
- **Digest**: `id String`, `userId String`, `recipientEmail String`, `periodKey String`, `periodStart/End`, `status`, `attemptCount`, `providerMessageId?`, `lastError?`, `sentAt?`. `@@unique([userId, periodKey])`.
- **DigestItem**: `id String`, `digestId`(FK), `userId String`, `policyEventId`(FK), `payloadSnapshot Json`, `position`. `@@unique([digestId, policyEventId])`, `@@unique([userId, policyEventId])`.
- **UpgradeInterest**: `id String`, `userId String?`, `email`, `normalizedEmail`, `source`, `consentedAt`, `createdAt`. (발송 원장 아님)

## 3. 착수 전 설계 결정 (codex)

- **A. 이메일 소스**: 발송 직전 Supabase **service-role Admin API로 auth.users 조회** → `Digest.recipientEmail` 저장 후 발송. 없으면 미발송+사유 기록. service-role 키 서버 전용.
- **B. 감지 위치/트랜잭션**: `batchUpsertBills`에 얹되 **배치 단위 트랜잭션**(조회→비교→upsert→`PolicyEvent.createMany`). 이메일은 트랜잭션 밖. `buildPolicyEvent(old,new)` 순수함수 분리. `updatedAt`만/날짜 단독 변경은 **미발송**. cron·수동에 동일 concurrency group.
- **C. 자동화**: 알림만 cron 금지. **일일 sync 자동화 + 주간 발송 전 sync 한 번 더 → 성공 시만 Digest**. KST→UTC 명시.
- **D. AdSense**: `/alerts` 등 폼 중심 페이지는 **noindex,follow + sitemap 제외**(robots 차단 X). 법안 상세 CTA는 indexable 유지. 빈 성공 URL 늘리지 않음.
- **E. Redis**: 원장·중복방지·락 전부 Postgres(DB unique constraint). 알림 worker에 Redis 미주입. Redis 장애에도 발송 테스트 통과.

## 4. 마이그레이션 위험 (prisma db push, migrate 아님)

위험도 **중간**(신규 5테이블만이라 손실 직접 위험 낮으나 db push는 전체 diff 적용 → 드리프트 주의). 순서:
1. DB 백업 + 실제 스키마 vs Prisma SQL diff 검토(DROP·컬럼변경 보이면 중단)
2. cron·알림 끈 채 schema-only 배포(신규 테이블만)
3. 제약·권한·RLS 확인 + 테스트 insert/delete
4. PolicyEvent writer 배포 → sync 1회 → Bill변경수 vs 이벤트수 대조
5. Watch API/UI 활성화 (`event.detectedAt >= watch.createdAt` 필수)
6. Digest dry-run + 내부 canary
7. 마지막 cron 활성화
- 롤백: 테이블 삭제 말고 이전 앱 버전으로. `--accept-data-loss` 금지.

## 5. 보안 (중요)

신규 테이블에 이메일·사용자 식별자 포함 → **Supabase Data API 노출 가능**. NestJS 서버만 접근하도록 **RLS 또는 anon/authenticated 권한 회수** 필요. Prisma·db push로 관리 안 되니 **별도 버전관리 보안 SQL 절차** 필요.

## 6. Phase 진행 원칙 (계획서 17장)

- Phase별 작은 커밋. 마이그레이션·live 발송은 별도 승인 단계.
- 결제·앱·AI·주제/의원 알림으로 범위 확대 금지.
- 각 Phase 종료 시 테스트·남은위험·롤백 보고.
