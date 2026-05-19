-- 후보자정보공개자료 (공직선거법 제49조) 요약 필드 — LocalElectionCandidate, Candidate 양쪽
ALTER TABLE "LocalElectionCandidate"
  ADD COLUMN "assetDeclared" BIGINT,
  ADD COLUMN "militaryService" TEXT,
  ADD COLUMN "taxPaid" BIGINT,
  ADD COLUMN "taxOverdue5y" BIGINT,
  ADD COLUMN "taxOverdueCurrent" BIGINT,
  ADD COLUMN "criminalRecord" TEXT,
  ADD COLUMN "electionCount" INTEGER;

ALTER TABLE "Candidate"
  ADD COLUMN "assetDeclared" BIGINT,
  ADD COLUMN "militaryService" TEXT,
  ADD COLUMN "taxPaid" BIGINT,
  ADD COLUMN "taxOverdue5y" BIGINT,
  ADD COLUMN "taxOverdueCurrent" BIGINT,
  ADD COLUMN "criminalRecord" TEXT,
  ADD COLUMN "electionCount" INTEGER;
