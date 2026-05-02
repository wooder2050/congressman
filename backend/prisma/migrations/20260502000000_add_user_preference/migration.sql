-- CreateTable
CREATE TABLE "UserPreference" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "district" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bookmarkedBills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bookmarkedMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");
CREATE INDEX "UserPreference_userId_idx" ON "UserPreference"("userId");

-- RLS: anon/authenticated 직접 접근 차단 (NestJS backend만 service_role로 접근)
ALTER TABLE "UserPreference" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "UserPreference" FROM anon, authenticated;
