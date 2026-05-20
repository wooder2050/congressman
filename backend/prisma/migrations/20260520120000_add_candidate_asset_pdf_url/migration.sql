-- 재산신고서 원문 PDF URL (NEC info.nec.go.kr) — LocalElectionCandidate, Candidate 양쪽
ALTER TABLE "LocalElectionCandidate" ADD COLUMN "assetPdfUrl" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "assetPdfUrl" TEXT;
