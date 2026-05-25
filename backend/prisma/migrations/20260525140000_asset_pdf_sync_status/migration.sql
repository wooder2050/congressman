-- PDF→PNG sync 부분 성공/재처리 추적 (PR #376 리뷰 #2, #3)
ALTER TABLE "Candidate" ADD COLUMN "assetPdfSourceHash" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "assetPdfSyncStatus" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "assetPdfSyncError" TEXT;

ALTER TABLE "LocalElectionCandidate" ADD COLUMN "assetPdfSourceHash" TEXT;
ALTER TABLE "LocalElectionCandidate" ADD COLUMN "assetPdfSyncStatus" TEXT;
ALTER TABLE "LocalElectionCandidate" ADD COLUMN "assetPdfSyncError" TEXT;
