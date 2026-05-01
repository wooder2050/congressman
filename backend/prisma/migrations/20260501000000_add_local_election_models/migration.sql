-- CreateTable
CREATE TABLE "LocalElection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "ordinal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalElection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalElectionRace" (
    "id" SERIAL NOT NULL,
    "electionId" TEXT NOT NULL,
    "electionType" TEXT NOT NULL,
    "sido" TEXT NOT NULL,
    "sigungu" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "displayName" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL DEFAULT 1,
    "sgId" TEXT NOT NULL DEFAULT '',
    "sgTypecode" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalElectionRace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalElectionCandidate" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "partyId" TEXT,
    "photoUrl" TEXT,
    "birthDate" TEXT,
    "gender" TEXT,
    "career" TEXT,
    "education" TEXT,
    "slogan" TEXT,
    "pledges" JSONB NOT NULL DEFAULT '[]',
    "assets" TEXT,
    "candidateNumber" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "voteCount" INTEGER,
    "voteRate" DOUBLE PRECISION,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "huboid" TEXT NOT NULL DEFAULT '',
    "memberIdRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalElectionCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalElectionRace_electionId_electionType_sido_sigungu_dist_key" ON "LocalElectionRace"("electionId", "electionType", "sido", "sigungu", "district");

-- CreateIndex
CREATE INDEX "LocalElectionRace_electionId_electionType_idx" ON "LocalElectionRace"("electionId", "electionType");

-- CreateIndex
CREATE INDEX "LocalElectionRace_electionId_sido_idx" ON "LocalElectionRace"("electionId", "sido");

-- CreateIndex
CREATE UNIQUE INDEX "LocalElectionCandidate_raceId_name_key" ON "LocalElectionCandidate"("raceId", "name");

-- CreateIndex
CREATE INDEX "LocalElectionCandidate_raceId_idx" ON "LocalElectionCandidate"("raceId");

-- CreateIndex
CREATE INDEX "LocalElectionCandidate_partyId_idx" ON "LocalElectionCandidate"("partyId");

-- AddForeignKey
ALTER TABLE "LocalElectionRace" ADD CONSTRAINT "LocalElectionRace_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "LocalElection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalElectionCandidate" ADD CONSTRAINT "LocalElectionCandidate_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "LocalElectionRace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalElectionCandidate" ADD CONSTRAINT "LocalElectionCandidate_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
