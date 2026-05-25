-- 자산 항목 검수 메타데이터 (codex PR #377 리뷰 #6)
ALTER TABLE "CandidateAssetItem" ADD COLUMN "reviewedAt" TIMESTAMP(3);
ALTER TABLE "CandidateAssetItem" ADD COLUMN "reviewer" TEXT;
ALTER TABLE "CandidateAssetItem" ADD COLUMN "pdfSourceHash" TEXT;
