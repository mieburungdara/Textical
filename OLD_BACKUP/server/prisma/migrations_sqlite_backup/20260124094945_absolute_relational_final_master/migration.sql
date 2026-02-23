/*
  Warnings:

  - You are about to drop the column `name` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `npcId` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `originalId` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `soldPrice` on the `MarketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `exp` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `masteryPoints` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `JobTemplate` table. All the data in the column will be lost.
  - Added the required column `message` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RegionResource" ADD COLUMN "requiredJobId" INTEGER;

-- CreateTable
CREATE TABLE "QuestReward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER,
    "amount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "QuestReward_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_StatusEffectTemplate" ("id") SELECT "id" FROM "StatusEffectTemplate";
DROP TABLE "StatusEffectTemplate";
ALTER TABLE "new_StatusEffectTemplate" RENAME TO "StatusEffectTemplate";
CREATE TABLE "new_DialogueTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_DialogueTemplate" ("id") SELECT "id" FROM "DialogueTemplate";
DROP TABLE "DialogueTemplate";
ALTER TABLE "new_DialogueTemplate" RENAME TO "DialogueTemplate";
CREATE TABLE "new_HallOfFame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_HallOfFame" ("id") SELECT "id" FROM "HallOfFame";
DROP TABLE "HallOfFame";
ALTER TABLE "new_HallOfFame" RENAME TO "HallOfFame";
CREATE TABLE "new_MarketHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_MarketHistory" ("id") SELECT "id" FROM "MarketHistory";
DROP TABLE "MarketHistory";
ALTER TABLE "new_MarketHistory" RENAME TO "MarketHistory";
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "classId" INTEGER NOT NULL DEFAULT 1001,
    "jobId" INTEGER,
    "jobLevel" INTEGER NOT NULL DEFAULT 1,
    "jobExp" INTEGER NOT NULL DEFAULT 0,
    "jobRank" TEXT NOT NULL DEFAULT 'APPRENTICE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "createdAt", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "name", "userId") SELECT "classId", "createdAt", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "name", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_JobTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_JobTemplate" ("id", "name") SELECT "id", "name" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
CREATE TABLE "new_Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("id", "type", "userId") SELECT "id", "type", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
