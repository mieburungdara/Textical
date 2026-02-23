-- Create CraftingSkill table for tracking user profession progress
CREATE TABLE IF NOT EXISTS "CraftingSkill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "profession" TEXT NOT NULL,
    "rank" TEXT NOT NULL DEFAULT 'NOVICE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "totalCrafts" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CraftingSkill_userId_profession_key" ON "CraftingSkill"("userId", "profession");
CREATE INDEX IF NOT EXISTS "CraftingSkill_userId_idx" ON "CraftingSkill"("userId");

-- Create CraftingLog table for analytics
CREATE TABLE IF NOT EXISTS "CraftingLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "profession" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "itemRarity" TEXT NOT NULL,
    "successRate" REAL NOT NULL,
    "rolled" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "CraftingLog_userId_idx" ON "CraftingLog"("userId");
CREATE INDEX IF NOT EXISTS "CraftingLog_createdAt_idx" ON "CraftingLog"("createdAt");
