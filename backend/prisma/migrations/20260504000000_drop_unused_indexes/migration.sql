-- 미사용 인덱스 제거 (idx_scan = 0, pg_stat_user_indexes 기준)
-- BillProposer_memberId_idx: BillProposer_memberId_role_idx (memberId, role)가 leading column으로 커버
-- 작은 인덱스(8MB)라 락 시간은 ms 단위.
--
-- Bill_status_idx는 보존: GET /bills?status=xxx 가 termId 없이 status 단독 필터를
-- 허용하므로 (termId, status) 복합 인덱스로는 status-only lookup을 커버할 수 없음.

DROP INDEX IF EXISTS "BillProposer_memberId_idx";
