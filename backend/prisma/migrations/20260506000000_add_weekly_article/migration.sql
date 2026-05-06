-- CreateTable
CREATE TABLE "WeeklyArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredBills" JSONB NOT NULL DEFAULT '[]',
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "stats" JSONB,
    "analysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyArticle_publishedDate_idx" ON "WeeklyArticle"("publishedDate");
