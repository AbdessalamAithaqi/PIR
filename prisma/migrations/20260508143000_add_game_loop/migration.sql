ALTER TABLE "Team" ADD COLUMN "pubScore" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "merchScore" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "wins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "draws" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "losses" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "pointDiff" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "ready" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "stats" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "market" BOOLEAN NOT NULL DEFAULT false,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "TeamPlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "starter" BOOLEAN NOT NULL DEFAULT false,
    "slot" INTEGER NOT NULL DEFAULT 0,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Bid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "Bid_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bid_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "MarketingDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundNumber" INTEGER NOT NULL,
    "pubInvestment" INTEGER NOT NULL DEFAULT 0,
    "merchInvestment" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "MarketingDecision_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundNumber" INTEGER NOT NULL,
    "scoreA" REAL NOT NULL,
    "scoreB" REAL NOT NULL,
    "resultA" TEXT NOT NULL,
    "resultB" TEXT NOT NULL,
    "fanDeltaA" INTEGER NOT NULL,
    "fanDeltaB" INTEGER NOT NULL,
    "moneyDeltaA" REAL NOT NULL,
    "moneyDeltaB" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" TEXT NOT NULL,
    "teamAId" TEXT NOT NULL,
    "teamBId" TEXT NOT NULL,
    CONSTRAINT "MatchResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TeamPlayer_teamId_playerId_key" ON "TeamPlayer"("teamId", "playerId");
CREATE UNIQUE INDEX "Bid_teamId_playerId_roundNumber_key" ON "Bid"("teamId", "playerId", "roundNumber");
CREATE UNIQUE INDEX "MarketingDecision_teamId_roundNumber_key" ON "MarketingDecision"("teamId", "roundNumber");
