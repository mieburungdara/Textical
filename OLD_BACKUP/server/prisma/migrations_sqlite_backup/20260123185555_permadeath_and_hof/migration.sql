/*
  Warnings:

  - You are about to drop the column `equipment` on the `Hero` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "HallOfFame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "classTier" INTEGER NOT NULL,
    "generation" INTEGER NOT NULL,
    "finalDeeds" TEXT NOT NULL,
    "deathDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "causeOfDeath" TEXT NOT NULL
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("acquiredTraits", "activeBehavior", "baseStats", "createdAt", "deeds", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "level", "motherId", "name", "naturalTraits", "race", "templateId", "unlockedBehaviors", "userId") SELECT "acquiredTraits", "activeBehavior", "baseStats", "createdAt", "deeds", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "level", "motherId", "name", "naturalTraits", "race", "templateId", "unlockedBehaviors", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
