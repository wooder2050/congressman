-- CandidateAssetItem 무결성 보강 (PR #375 리뷰 #2, #7)

-- (1) Polymorphic FK 무결성: localCandidateId와 byCandidateId 중 정확히 하나만 채워져야 함
ALTER TABLE "CandidateAssetItem"
  ADD CONSTRAINT "CandidateAssetItem_target_xor"
  CHECK (
    ("localCandidateId" IS NOT NULL AND "byCandidateId" IS NULL)
    OR ("localCandidateId" IS NULL AND "byCandidateId" IS NOT NULL)
  );

-- (2) Idempotency 보강: 동일 (후보, 출처일자, 카테고리, 관계, 상세) 조합 unique
-- description은 너무 길어 hash로 잡거나, 일단 partial index 두 개로 분리
-- localCandidate와 byCandidate를 각각 partial unique로 처리
CREATE UNIQUE INDEX "CandidateAssetItem_local_unique"
  ON "CandidateAssetItem" (
    "localCandidateId",
    "source",
    "sourceDate",
    "category",
    "relation",
    md5("description")
  )
  WHERE "localCandidateId" IS NOT NULL;

CREATE UNIQUE INDEX "CandidateAssetItem_by_unique"
  ON "CandidateAssetItem" (
    "byCandidateId",
    "source",
    "sourceDate",
    "category",
    "relation",
    md5("description")
  )
  WHERE "byCandidateId" IS NOT NULL;
