/*
  Warnings:

  - You are about to drop the `BehaviourWeight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BuildingPerk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BuildingUpgrade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestReward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkillTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `name` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `exp` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `MailAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `MarketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `npcId` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `BuildingInstance` table. All the data in the column will be lost.
  - You are about to drop the column `isUnlocked` on the `UserAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `isFinished` on the `HeroAuctionListing` table. All the data in the column will be lost.
  - You are about to drop the column `startingPrice` on the `HeroAuctionListing` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `QuestObjective` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `vaultGold` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `HallOfFame` table. All the data in the column will be lost.
  - Added the required column `description` to the `ItemSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `ItemTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BehaviourWeight";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BuildingPerk";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BuildingUpgrade";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "QuestReward";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SkillTemplate";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RegionResource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "spawnChance" REAL NOT NULL DEFAULT 1.0,
    "gatherDifficulty" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "RegionResource_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionResource_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" REAL NOT NULL,
    CONSTRAINT "ItemStat_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_ItemSet" ("id", "name") SELECT "id", "name" FROM "ItemSet";
DROP TABLE "ItemSet";
ALTER TABLE "new_ItemSet" RENAME TO "ItemSet";
CREATE TABLE "new_StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_StatusEffectTemplate" ("id") SELECT "id" FROM "StatusEffectTemplate";
DROP TABLE "StatusEffectTemplate";
ALTER TABLE "new_StatusEffectTemplate" RENAME TO "StatusEffectTemplate";
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "classId" INTEGER NOT NULL DEFAULT 1001,
    "jobId" INTEGER,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "id", "jobId", "level", "name", "userId") SELECT "classId", "id", "jobId", "level", "name", "userId" FROM "Hero";
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
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "subCategory" TEXT NOT NULL DEFAULT 'MISC',
    "baseDurability" INTEGER NOT NULL DEFAULT 100,
    "repairCostPerPt" INTEGER NOT NULL DEFAULT 1,
    "setId" INTEGER,
    "filePath" TEXT NOT NULL DEFAULT 'items/misc.json',
    CONSTRAINT "ItemTemplate_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ItemSet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("baseDurability", "category", "filePath", "id", "name", "setId") SELECT "baseDurability", "category", "filePath", "id", "name", "setId" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
CREATE TABLE "new_MailAttachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mailId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    CONSTRAINT "MailAttachment_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MailAttachment" ("id", "mailId", "templateId") SELECT "id", "mailId", "templateId" FROM "MailAttachment";
DROP TABLE "MailAttachment";
ALTER TABLE "new_MailAttachment" RENAME TO "MailAttachment";
CREATE TABLE "new_MarketHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_MarketHistory" ("id") SELECT "id" FROM "MarketHistory";
DROP TABLE "MarketHistory";
ALTER TABLE "new_MarketHistory" RENAME TO "MarketHistory";
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_QuestTemplate" ("id", "name") SELECT "id", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
CREATE TABLE "new_DialogueTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_DialogueTemplate" ("id") SELECT "id" FROM "DialogueTemplate";
DROP TABLE "DialogueTemplate";
ALTER TABLE "new_DialogueTemplate" RENAME TO "DialogueTemplate";
CREATE TABLE "new_RecipeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "resultItemId" INTEGER NOT NULL,
    CONSTRAINT "RecipeTemplate_resultItemId_fkey" FOREIGN KEY ("resultItemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeTemplate" ("id", "name", "resultItemId") SELECT "id", "name", "resultItemId" FROM "RecipeTemplate";
DROP TABLE "RecipeTemplate";
ALTER TABLE "new_RecipeTemplate" RENAME TO "RecipeTemplate";
CREATE TABLE "new_BuildingInstance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "BuildingInstance_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BuildingInstance" ("id", "level", "regionId", "templateId") SELECT "id", "level", "regionId", "templateId" FROM "BuildingInstance";
DROP TABLE "BuildingInstance";
ALTER TABLE "new_BuildingInstance" RENAME TO "BuildingInstance";
CREATE TABLE "new_UserAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserAchievement" ("achievementId", "id", "userId") SELECT "achievementId", "id", "userId" FROM "UserAchievement";
DROP TABLE "UserAchievement";
ALTER TABLE "new_UserAchievement" RENAME TO "UserAchievement";
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE TABLE "new_HeroAuctionListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "HeroAuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroAuctionListing" ("expiresAt", "heroId", "id", "sellerId", "templateId") SELECT "expiresAt", "heroId", "id", "sellerId", "templateId" FROM "HeroAuctionListing";
DROP TABLE "HeroAuctionListing";
ALTER TABLE "new_HeroAuctionListing" RENAME TO "HeroAuctionListing";
CREATE UNIQUE INDEX "HeroAuctionListing_heroId_key" ON "HeroAuctionListing"("heroId");
CREATE TABLE "new_QuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    CONSTRAINT "QuestObjective_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuestObjective" ("id", "questId", "targetId", "type") SELECT "id", "questId", "targetId", "type" FROM "QuestObjective";
DROP TABLE "QuestObjective";
ALTER TABLE "new_QuestObjective" RENAME TO "QuestObjective";
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_GuildTemplate" ("id", "name") SELECT "id", "name" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("id", "type", "userId") SELECT "id", "type", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE TABLE "new_GlobalEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_GlobalEventTemplate" ("id", "name") SELECT "id", "name" FROM "GlobalEventTemplate";
DROP TABLE "GlobalEventTemplate";
ALTER TABLE "new_GlobalEventTemplate" RENAME TO "GlobalEventTemplate";
CREATE TABLE "new_Mail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiverId" INTEGER NOT NULL,
    "senderId" INTEGER,
    "subject" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Mail_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mail_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mail" ("expiresAt", "id", "receiverId", "senderId", "subject") SELECT "expiresAt", "id", "receiverId", "senderId", "subject" FROM "Mail";
DROP TABLE "Mail";
ALTER TABLE "new_Mail" RENAME TO "Mail";
CREATE TABLE "new_AchievementTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_AchievementTemplate" ("id", "name") SELECT "id", "name" FROM "AchievementTemplate";
DROP TABLE "AchievementTemplate";
ALTER TABLE "new_AchievementTemplate" RENAME TO "AchievementTemplate";
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("id", "name", "templateId") SELECT "id", "name", "templateId" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
CREATE TABLE "new_BehaviourTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_BehaviourTemplate" ("id", "name") SELECT "id", "name" FROM "BehaviourTemplate";
DROP TABLE "BehaviourTemplate";
ALTER TABLE "new_BehaviourTemplate" RENAME TO "BehaviourTemplate";
CREATE TABLE "new_HallOfFame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
INSERT INTO "new_HallOfFame" ("id") SELECT "id" FROM "HallOfFame";
DROP TABLE "HallOfFame";
ALTER TABLE "new_HallOfFame" RENAME TO "HallOfFame";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
