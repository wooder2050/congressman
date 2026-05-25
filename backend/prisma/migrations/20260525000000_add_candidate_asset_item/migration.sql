-- CreateTable
CREATE TABLE "CandidateAssetItem" (
    "id" SERIAL NOT NULL,
    "localCandidateId" INTEGER,
    "byCandidateId" INTEGER,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "relation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "currentValue" BIGINT,
    "previousValue" BIGINT,
    "increaseValue" BIGINT,
    "decreaseValue" BIGINT,
    "marketPrice" BIGINT,
    "changeReason" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceDate" TEXT,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateAssetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateAssetItem_localCandidateId_idx" ON "CandidateAssetItem"("localCandidateId");

-- CreateIndex
CREATE INDEX "CandidateAssetItem_byCandidateId_idx" ON "CandidateAssetItem"("byCandidateId");

-- CreateIndex
CREATE INDEX "CandidateAssetItem_source_idx" ON "CandidateAssetItem"("source");

-- CreateIndex
CREATE INDEX "CandidateAssetItem_category_idx" ON "CandidateAssetItem"("category");

-- AddForeignKey
ALTER TABLE "CandidateAssetItem" ADD CONSTRAINT "CandidateAssetItem_localCandidateId_fkey" FOREIGN KEY ("localCandidateId") REFERENCES "LocalElectionCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateAssetItem" ADD CONSTRAINT "CandidateAssetItem_byCandidateId_fkey" FOREIGN KEY ("byCandidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
