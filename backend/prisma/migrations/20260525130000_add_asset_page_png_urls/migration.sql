-- 재산신고서 PDF → PNG 변환 미러링 URL (4단계 PDF 인라인 미리보기)
ALTER TABLE "Candidate" ADD COLUMN "assetPagePngUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "LocalElectionCandidate" ADD COLUMN "assetPagePngUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
