CREATE TABLE "GameParameter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "injuryChance" INTEGER NOT NULL DEFAULT 12,
    "fanGain" INTEGER NOT NULL DEFAULT 20,
    "financialGrowth" INTEGER NOT NULL DEFAULT 8,
    "luckFactor" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "GameParameter_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "GameParameter_gameId_key" ON "GameParameter"("gameId");
