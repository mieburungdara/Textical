/*
  Warnings:

  - You are about to drop the column `bonusData` on the `RaceBonusTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `fameReward` on the `QuestBranch` table. All the data in the column will be lost.
  - You are about to drop the column `goldReward` on the `QuestBranch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[heroId,behaviorId]` on the table `HeroBehavior` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[heroId,deedKey]` on the table `HeroDeed` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[heroId,slotKey]` on the table `HeroEquipment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[itemInstanceId]` on the table `HeroEquipment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[heroId,statKey]` on the table `HeroStat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[heroId,traitId]` on the table `HeroTrait` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `npcId` to the `DialogueTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `StatusEffectTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `SkillTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `JobTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RaceStatBonus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "raceTemplateId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "bonusValue" REAL NOT NULL,
    CONSTRAINT "RaceStatBonus_raceTemplateId_fkey" FOREIGN KEY ("raceTemplateId") REFERENCES "RaceBonusTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BehaviourTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'behaviors/misc.json'
);
INSERT INTO "new_BehaviourTemplate" ("id", "name") SELECT "id", "name" FROM "BehaviourTemplate";
DROP TABLE "BehaviourTemplate";
ALTER TABLE "new_BehaviourTemplate" RENAME TO "BehaviourTemplate";
CREATE TABLE "new_DialogueTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'dialogues/misc.json'
);
INSERT INTO "new_DialogueTemplate" ("id") SELECT "id" FROM "DialogueTemplate";
DROP TABLE "DialogueTemplate";
ALTER TABLE "new_DialogueTemplate" RENAME TO "DialogueTemplate";
CREATE TABLE "new_StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'effects/misc.json'
);
INSERT INTO "new_StatusEffectTemplate" ("id") SELECT "id" FROM "StatusEffectTemplate";
DROP TABLE "StatusEffectTemplate";
ALTER TABLE "new_StatusEffectTemplate" RENAME TO "StatusEffectTemplate";
CREATE TABLE "new_RaceBonusTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'Human',
    "filePath" TEXT NOT NULL DEFAULT 'races/misc.json'
);
INSERT INTO "new_RaceBonusTemplate" ("id") SELECT "id" FROM "RaceBonusTemplate";
DROP TABLE "RaceBonusTemplate";
ALTER TABLE "new_RaceBonusTemplate" RENAME TO "RaceBonusTemplate";
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT '',
    "categoryId" INTEGER NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json',
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "filePath", "hp_base", "id") SELECT "categoryId", "damage_base", "filePath", "hp_base", "id" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classId" INTEGER NOT NULL DEFAULT 1001,
    "jobId" INTEGER,
    "jobLevel" INTEGER NOT NULL DEFAULT 1,
    "jobExp" INTEGER NOT NULL DEFAULT 0,
    "jobRank" TEXT NOT NULL DEFAULT 'APPRENTICE',
    "masteryPoints" INTEGER NOT NULL DEFAULT 0,
    "gridX" INTEGER,
    "gridY" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "createdAt", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "masteryPoints", "name", "userId") SELECT "classId", "createdAt", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "masteryPoints", "name", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE UNIQUE INDEX "Hero_userId_gridX_gridY_key" ON "Hero"("userId", "gridX", "gridY");
CREATE TABLE "new_TraitTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'traits/misc.json'
);
INSERT INTO "new_TraitTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "TraitTemplate";
DROP TABLE "TraitTemplate";
ALTER TABLE "new_TraitTemplate" RENAME TO "TraitTemplate";
CREATE TABLE "new_AchievementTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'achievements/misc.json'
);
INSERT INTO "new_AchievementTemplate" ("id", "name") SELECT "id", "name" FROM "AchievementTemplate";
DROP TABLE "AchievementTemplate";
ALTER TABLE "new_AchievementTemplate" RENAME TO "AchievementTemplate";
CREATE TABLE "new_QuestBranch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "choiceKey" TEXT NOT NULL,
    "nextNodeId" INTEGER,
    CONSTRAINT "QuestBranch_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuestBranch" ("choiceKey", "id", "nextNodeId", "questId") SELECT "choiceKey", "id", "nextNodeId", "questId" FROM "QuestBranch";
DROP TABLE "QuestBranch";
ALTER TABLE "new_QuestBranch" RENAME TO "QuestBranch";
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'SIDE',
    "difficulty" TEXT NOT NULL DEFAULT 'NORMAL',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "prerequisiteQuestId" INTEGER,
    "isTimeLimited" BOOLEAN NOT NULL DEFAULT false,
    "expiryHours" INTEGER NOT NULL DEFAULT 0,
    "requiredRegion" INTEGER,
    "filePath" TEXT NOT NULL DEFAULT 'quests/misc.json'
);
INSERT INTO "new_QuestTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
CREATE TABLE "new_SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'skills/misc.json'
);
INSERT INTO "new_SkillTemplate" ("id") SELECT "id" FROM "SkillTemplate";
DROP TABLE "SkillTemplate";
ALTER TABLE "new_SkillTemplate" RENAME TO "SkillTemplate";
CREATE TABLE "new_GlobalEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'events/misc.json'
);
INSERT INTO "new_GlobalEventTemplate" ("id", "name") SELECT "id", "name" FROM "GlobalEventTemplate";
DROP TABLE "GlobalEventTemplate";
ALTER TABLE "new_GlobalEventTemplate" RENAME TO "GlobalEventTemplate";
CREATE TABLE "new_JobTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'COLLECTION',
    "filePath" TEXT NOT NULL DEFAULT 'jobs/misc.json'
);
INSERT INTO "new_JobTemplate" ("id") SELECT "id" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "HeroBehavior_heroId_behaviorId_key" ON "HeroBehavior"("heroId", "behaviorId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroDeed_heroId_deedKey_key" ON "HeroDeed"("heroId", "deedKey");

-- CreateIndex
CREATE UNIQUE INDEX "HeroEquipment_heroId_slotKey_key" ON "HeroEquipment"("heroId", "slotKey");

-- CreateIndex
CREATE UNIQUE INDEX "HeroEquipment_itemInstanceId_key" ON "HeroEquipment"("itemInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroStat_heroId_statKey_key" ON "HeroStat"("heroId", "statKey");

-- CreateIndex
CREATE UNIQUE INDEX "HeroTrait_heroId_traitId_key" ON "HeroTrait"("heroId", "traitId");
