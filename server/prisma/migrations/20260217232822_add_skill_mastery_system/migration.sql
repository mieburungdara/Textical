-- CreateTable
CREATE TABLE "SkillMastery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'NOVICE',
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SkillMasteryReward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "level" TEXT NOT NULL,
    "usesRequired" INTEGER NOT NULL,
    "skillDamageBonus" REAL NOT NULL DEFAULT 0,
    "effectDurationBonus" REAL NOT NULL DEFAULT 0,
    "critChanceBonus" REAL NOT NULL DEFAULT 0,
    "costReduction" REAL NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE INDEX "SkillMastery_userId_idx" ON "SkillMastery"("userId");

-- CreateIndex
CREATE INDEX "SkillMastery_heroId_idx" ON "SkillMastery"("heroId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillMastery_heroId_skillId_key" ON "SkillMastery"("heroId", "skillId");
