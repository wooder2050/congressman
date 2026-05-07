-- Add bookmarkedBreakingNews column to UserPreference
ALTER TABLE "UserPreference"
ADD COLUMN "bookmarkedBreakingNews" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
