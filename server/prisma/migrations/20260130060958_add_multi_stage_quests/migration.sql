/*
  Warnings:

  - You are about to drop the column `questId` on the `QuestObjective` table. All the data in the column will be lost.
  - You are about to drop the column `questId` on the `QuestReward` table. All the data in the column will be lost.
  - Added the required column `stageId` to the `QuestObjective` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageId` to the `QuestReward` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "QuestStage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "QuestStage_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stageId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    CONSTRAINT "QuestObjective_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "QuestStage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuestObjective" ("amount", "description", "id", "targetId", "type") SELECT "amount", "description", "id", "targetId", "type" FROM "QuestObjective";
DROP TABLE "QuestObjective";
ALTER TABLE "new_QuestObjective" RENAME TO "QuestObjective";
CREATE TABLE "new_UserQuest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "currentStageId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "QuestStage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserQuest" ("id", "questId", "status", "userId") SELECT "id", "questId", "status", "userId" FROM "UserQuest";
DROP TABLE "UserQuest";
ALTER TABLE "new_UserQuest" RENAME TO "UserQuest";
CREATE TABLE "new_QuestReward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stageId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" INTEGER,
    "amount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "QuestReward_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "QuestStage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuestReward" ("amount", "id", "type") SELECT "amount", "id", "type" FROM "QuestReward";
DROP TABLE "QuestReward";
ALTER TABLE "new_QuestReward" RENAME TO "QuestReward";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "QuestStage_questId_order_key" ON "QuestStage"("questId", "order");
