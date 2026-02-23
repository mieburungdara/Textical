/*
  Warnings:

  - You are about to drop the column `efficiencyStats` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `masteryTraitId` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `specialties` on the `JobTemplate` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COLLECTION',
    "workStats" TEXT NOT NULL DEFAULT '{}',
    "lootTable" TEXT NOT NULL DEFAULT '[]',
    "toolAccess" TEXT NOT NULL DEFAULT '{}',
    "masteryRewards" TEXT NOT NULL DEFAULT '{}',
    "passiveBonuses" TEXT NOT NULL DEFAULT '{}',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/jobs/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'jobs/misc.json'
);
INSERT INTO "new_JobTemplate" ("category", "description", "filePath", "iconPath", "id", "name", "passiveBonuses") SELECT "category", "description", "filePath", "iconPath", "id", "name", "passiveBonuses" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
CREATE TABLE "new_Hero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classId" TEXT NOT NULL DEFAULT 'class_novice',
    "classTier" INTEGER NOT NULL DEFAULT 1,
    "jobId" TEXT,
    "jobLevel" INTEGER NOT NULL DEFAULT 1,
    "jobExp" INTEGER NOT NULL DEFAULT 0,
    "jobRank" TEXT NOT NULL DEFAULT 'APPRENTICE',
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
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("acquiredTraits", "activeBehavior", "baseStats", "classId", "classTier", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "jobExp", "jobId", "jobLevel", "level", "motherId", "name", "naturalTraits", "race", "unlockedBehaviors", "userId") SELECT "acquiredTraits", "activeBehavior", "baseStats", "classId", "classTier", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "jobExp", "jobId", "jobLevel", "level", "motherId", "name", "naturalTraits", "race", "unlockedBehaviors", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
