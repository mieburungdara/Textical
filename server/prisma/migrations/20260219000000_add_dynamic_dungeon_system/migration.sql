-- Create DungeonModifier table
CREATE TABLE "DungeonModifier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modifierKey" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "statMultipliers" TEXT NOT NULL DEFAULT '{}',
    "statusEffects" TEXT NOT NULL DEFAULT '[]',
    "icon" TEXT NOT NULL DEFAULT '⚡',
    "color" TEXT NOT NULL DEFAULT '#ff0000'
);

-- Create DungeonTemplate table
CREATE TABLE "DungeonTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dungeonKey" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "recommendedLevel" INTEGER NOT NULL DEFAULT 1,
    "recommendedItemPower" INTEGER NOT NULL DEFAULT 0,
    "requiredQuestId" INTEGER,
    "requiredAchievementId" INTEGER,
    "entryCost" INTEGER NOT NULL DEFAULT 0,
    "minPartySize" INTEGER NOT NULL DEFAULT 1,
    "maxPartySize" INTEGER NOT NULL DEFAULT 1,
    "scenePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "ambientMusicId" INTEGER,
    "baseGoldReward" INTEGER NOT NULL DEFAULT 100,
    "baseXpReward" INTEGER NOT NULL DEFAULT 50,
    "totalFloors" INTEGER NOT NULL DEFAULT 3,
    "isRepeatable" INTEGER NOT NULL DEFAULT 1,
    "resetType" TEXT NOT NULL DEFAULT 'DAILY'
);

-- Create DungeonFloor table
CREATE TABLE "DungeonFloor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dungeonId" INTEGER NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gridWidth" INTEGER NOT NULL DEFAULT 8,
    "gridHeight" INTEGER NOT NULL DEFAULT 8,
    "tileMapPath" TEXT,
    "monsterPoolIds" TEXT NOT NULL DEFAULT '[]',
    "eliteSpawnRate" REAL NOT NULL DEFAULT 0.1,
    "bossSpawnRate" REAL NOT NULL DEFAULT 0.0,
    "monsterLevelScale" REAL NOT NULL DEFAULT 1.0,
    "goldRewardScale" REAL NOT NULL DEFAULT 1.0,
    "xpRewardScale" REAL NOT NULL DEFAULT 1.0,
    "lootBonusScale" REAL NOT NULL DEFAULT 1.0,
    "killCountRequired" INTEGER NOT NULL DEFAULT 10,
    "bossRequired" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY ("dungeonId") REFERENCES "DungeonTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("dungeonId", "floorNumber")
);

-- Create DungeonFloorModifier table
CREATE TABLE "DungeonFloorModifier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "floorId" INTEGER NOT NULL,
    "modifierId" INTEGER NOT NULL,
    "stackCount" INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY ("floorId") REFERENCES "DungeonFloor"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("modifierId") REFERENCES "DungeonModifier"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("floorId", "modifierId")
);

-- Create DungeonEntry table
CREATE TABLE "DungeonEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "dungeonId" INTEGER NOT NULL,
    "currentFloor" INTEGER NOT NULL DEFAULT 1,
    "highestFloor" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "floorProgress" TEXT NOT NULL DEFAULT '{}',
    "firstEnteredAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEnteredAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TEXT,
    "lastResetAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalGoldEarned" INTEGER NOT NULL DEFAULT 0,
    "totalXpEarned" INTEGER NOT NULL DEFAULT 0,
    "rewardsClaimed" TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("dungeonId") REFERENCES "DungeonTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("userId", "dungeonId")
);

-- Create index for DungeonEntry userId
CREATE INDEX "DungeonEntry_userId_idx" ON "DungeonEntry"("userId");

-- Add dungeonEntries relation to User table (for SQLite, we just need the column, FK is already in DungeonEntry)
-- Note: The User table already has the relation field in Prisma schema, but SQLite doesn't enforce this
