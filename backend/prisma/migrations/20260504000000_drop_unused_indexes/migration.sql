-- 미사용 인덱스 제거 (idx_scan = 0, pg_stat_user_indexes 기준)
-- BillProposer_memberId_idx: BillProposer_memberId_role_idx (memberId, role)가 leading column으로 커버
-- Bill_status_idx: Bill_termId_status_idx (termId, status)가 모든 status 쿼리를 커버
-- 둘 다 작은 인덱스(8MB, 1.7MB)라 락 시간은 ms 단위.

DROP INDEX IF EXISTS "BillProposer_memberId_idx";
DROP INDEX IF EXISTS "Bill_status_idx";
