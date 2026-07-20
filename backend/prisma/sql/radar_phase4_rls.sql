-- Lawmake Radar Phase 4: 이메일 원장 테이블 RLS.
-- 프로덕션은 `prisma db push`로 테이블만 생성되고 RLS는 적용되지 않으므로,
-- 배포 후 Supabase(execute_sql 또는 SQL Editor)에서 이 SQL을 1회 실행해야 한다.
-- (Phase 3 PolicyEvent·Watch와 동일한 backend-only 패턴: RLS ON + 정책 없음 + REVOKE)
--
-- 이 테이블들은 수신 이메일·본문 snapshot·수신거부 토큰이 가리키는 원장이라
-- Supabase Data API(anon/authenticated)로 절대 노출되면 안 된다. 백엔드(service_role)만 접근.

ALTER TABLE "DigestRun" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "DigestRun" FROM anon, authenticated;

ALTER TABLE "Digest" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "Digest" FROM anon, authenticated;

ALTER TABLE "DigestItem" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "DigestItem" FROM anon, authenticated;

ALTER TABLE "UpgradeInterest" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "UpgradeInterest" FROM anon, authenticated;
