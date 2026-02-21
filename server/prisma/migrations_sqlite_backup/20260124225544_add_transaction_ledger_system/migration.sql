/*
  Warnings:

  - You are about to drop the `RaceStatBonus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `description` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `RaceBonusTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `defense_base` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `element` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `exp_reward` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `range_base` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `speed_base` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `exp` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `rarity` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `npcId` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `baseSuccessRate` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `goldCost` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `minJobLevel` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredBuildingId` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredFame` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredJobId` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `resultQuantity` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `expiryHours` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isTimeLimited` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `minLevel` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `prerequisiteQuestId` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredRegion` on the `QuestTemplate` table. All the data in the column will be lost.
  - Added the required column `startingPrice` to the `HeroAuctionListing` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RaceStatBonus";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TransactionLedger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "currencyTier" TEXT NOT NULL,
    "amountDelta" INTEGER NOT NULL,
    "newBalance" INTEGER NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "filePath" TEXT NOT NULL DEFAULT 'classes/misc.json'
);
INSERT INTO "new_ClassTemplate" ("filePath", "id", "name", "tier") SELECT "filePath", "id", "name", "tier" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
CREATE TABLE "new_RaceBonusTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bonusData" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_RaceBonusTemplate" ("id") SELECT "id" FROM "RaceBonusTemplate";
DROP TABLE "RaceBonusTemplate";
ALTER TABLE "new_RaceBonusTemplate" RENAME TO "RaceBonusTemplate";
CREATE TABLE "new_Mail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiverId" INTEGER NOT NULL,
    "senderId" INTEGER,
    "subject" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mail_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mail_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mail" ("expiresAt", "id", "receiverId", "senderId", "subject") SELECT "expiresAt", "id", "receiverId", "senderId", "subject" FROM "Mail";
DROP TABLE "Mail";
ALTER TABLE "new_Mail" RENAME TO "Mail";
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json',
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "filePath", "hp_base", "id") SELECT "categoryId", "damage_base", "filePath", "hp_base", "id" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_BehaviourTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_BehaviourTemplate" ("id", "name") SELECT "id", "name" FROM "BehaviourTemplate";
DROP TABLE "BehaviourTemplate";
ALTER TABLE "new_BehaviourTemplate" RENAME TO "BehaviourTemplate";
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
    "masteryPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "createdAt", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "masteryPoints", "name", "userId") SELECT "classId", "createdAt", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "masteryPoints", "name", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_BuildingTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'buildings/misc.json'
);
INSERT INTO "new_BuildingTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "BuildingTemplate";
DROP TABLE "BuildingTemplate";
ALTER TABLE "new_BuildingTemplate" RENAME TO "BuildingTemplate";
CREATE TABLE "new_StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_StatusEffectTemplate" ("id") SELECT "id" FROM "StatusEffectTemplate";
DROP TABLE "StatusEffectTemplate";
ALTER TABLE "new_StatusEffectTemplate" RENAME TO "StatusEffectTemplate";
CREATE TABLE "new_UserAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserAchievement" ("achievementId", "id", "userId") SELECT "achievementId", "id", "userId" FROM "UserAchievement";
DROP TABLE "UserAchievement";
ALTER TABLE "new_UserAchievement" RENAME TO "UserAchievement";
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE TABLE "new_TraitTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'traits/misc.json'
);
INSERT INTO "new_TraitTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "TraitTemplate";
DROP TABLE "TraitTemplate";
ALTER TABLE "new_TraitTemplate" RENAME TO "TraitTemplate";
CREATE TABLE "new_GlobalEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_GlobalEventTemplate" ("id", "name") SELECT "id", "name" FROM "GlobalEventTemplate";
DROP TABLE "GlobalEventTemplate";
ALTER TABLE "new_GlobalEventTemplate" RENAME TO "GlobalEventTemplate";
CREATE TABLE "new_HeroAuctionListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "startingPrice" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HeroAuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroAuctionListing" ("expiresAt", "heroId", "id", "sellerId", "templateId") SELECT "expiresAt", "heroId", "id", "sellerId", "templateId" FROM "HeroAuctionListing";
DROP TABLE "HeroAuctionListing";
ALTER TABLE "new_HeroAuctionListing" RENAME TO "HeroAuctionListing";
CREATE UNIQUE INDEX "HeroAuctionListing_heroId_key" ON "HeroAuctionListing"("heroId");
CREATE TABLE "new_JobTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_JobTemplate" ("id") SELECT "id" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
CREATE TABLE "new_DialogueTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_DialogueTemplate" ("id") SELECT "id" FROM "DialogueTemplate";
DROP TABLE "DialogueTemplate";
ALTER TABLE "new_DialogueTemplate" RENAME TO "DialogueTemplate";
CREATE TABLE "new_AchievementTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_AchievementTemplate" ("id", "name") SELECT "id", "name" FROM "AchievementTemplate";
DROP TABLE "AchievementTemplate";
ALTER TABLE "new_AchievementTemplate" RENAME TO "AchievementTemplate";
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'guilds/misc.json'
);
INSERT INTO "new_GuildTemplate" ("description", "filePath", "id", "name") SELECT "description", "filePath", "id", "name" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_RecipeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "resultItemId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'recipes/misc.json',
    CONSTRAINT "RecipeTemplate_resultItemId_fkey" FOREIGN KEY ("resultItemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeTemplate" ("filePath", "id", "name", "resultItemId") SELECT "filePath", "id", "name", "resultItemId" FROM "RecipeTemplate";
DROP TABLE "RecipeTemplate";
ALTER TABLE "new_RecipeTemplate" RENAME TO "RecipeTemplate";
CREATE TABLE "new_SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_SkillTemplate" ("id") SELECT "id" FROM "SkillTemplate";
DROP TABLE "SkillTemplate";
ALTER TABLE "new_SkillTemplate" RENAME TO "SkillTemplate";
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'quests/misc.json'
);
INSERT INTO "new_QuestTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
