-- 재산신고서 PDF URL을 단일(assetPdfUrl) → 페이지별 배열(assetPdfUrls)로 변경
-- 재산신고서는 여러 장이며 1페이지는 표지(금액 없음)이므로 전체 페이지 URL을 보관한다.
ALTER TABLE "LocalElectionCandidate" DROP COLUMN IF EXISTS "assetPdfUrl";
ALTER TABLE "LocalElectionCandidate" ADD COLUMN "assetPdfUrls" TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE "Candidate" DROP COLUMN IF EXISTS "assetPdfUrl";
ALTER TABLE "Candidate" ADD COLUMN "assetPdfUrls" TEXT[] NOT NULL DEFAULT '{}';
