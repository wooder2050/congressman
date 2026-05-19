-- Add huboid column to Candidate (재보궐 후보자 NEC ID, info.nec.go.kr 사진/상세 페이지 키)
ALTER TABLE "Candidate" ADD COLUMN "huboid" TEXT;
CREATE UNIQUE INDEX "Candidate_huboid_key" ON "Candidate"("huboid");
