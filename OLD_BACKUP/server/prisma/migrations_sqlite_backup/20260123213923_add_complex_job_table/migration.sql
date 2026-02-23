-- CreateTable
CREATE TABLE "JobTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COLLECTION',
    "efficiencyStats" TEXT NOT NULL DEFAULT '{}',
    "specialties" TEXT NOT NULL DEFAULT '[]',
    "passiveBonuses" TEXT NOT NULL DEFAULT '{}',
    "masteryTraitId" TEXT,
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/jobs/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'jobs/misc.json'
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classTier" INTEGER NOT NULL DEFAULT 1,
    "jobId" TEXT,
    "jobLevel" INTEGER NOT NULL DEFAULT 1,
    "jobExp" INTEGER NOT NULL DEFAULT 0,
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "naturalTraits" TEXT NOT NULL DEFAULT '[]',
    "acquiredTraits" TEXT NOT NULL DEFAULT '[]',
    "unlockedBehaviors" TEXT NOT NULL DEFAULT '[]',
    "activeBehavior" TEXT NOT NULL DEFAULT 'balanced',
    "deeds" TEXT NOT NULL DEFAULT '{}',
    "hasReproduced" BOOLEAN NOT NULL DEFAULT false,
    "fatherId" TEXT,
    "motherId" TEXT,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "equipment" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("acquiredTraits", "activeBehavior", "baseStats", "classTier", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "level", "motherId", "name", "naturalTraits", "race", "templateId", "unlockedBehaviors", "userId") SELECT "acquiredTraits", "activeBehavior", "baseStats", "classTier", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "level", "motherId", "name", "naturalTraits", "race", "templateId", "unlockedBehaviors", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
