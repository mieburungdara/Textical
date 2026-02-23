/*
  Warnings:

  - Added the required column `startingPrice` to the `HeroAuctionListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `SkillTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `ClassTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "BuildingUpgrade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "goldCost" INTEGER NOT NULL,
    "fameRequired" INTEGER NOT NULL,
    CONSTRAINT "BuildingUpgrade_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuildingPerk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "levelRequired" INTEGER NOT NULL,
    "perkKey" TEXT NOT NULL,
    "value" REAL NOT NULL,
    CONSTRAINT "BuildingPerk_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT '',
    "categoryId" INTEGER NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "defense_base" INTEGER NOT NULL DEFAULT 0,
    "speed_base" INTEGER NOT NULL DEFAULT 10,
    "range_base" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 10,
    "element" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "size" TEXT NOT NULL DEFAULT 'MEDIUM',
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json',
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "filePath", "hp_base", "id") SELECT "categoryId", "damage_base", "filePath", "hp_base", "id" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_GlobalEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'WEATHER',
    "filePath" TEXT NOT NULL DEFAULT 'events/misc.json'
);
INSERT INTO "new_GlobalEventTemplate" ("id", "name") SELECT "id", "name" FROM "GlobalEventTemplate";
DROP TABLE "GlobalEventTemplate";
ALTER TABLE "new_GlobalEventTemplate" RENAME TO "GlobalEventTemplate";
CREATE TABLE "new_MonsterLootEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "chance" REAL NOT NULL,
    "minQty" INTEGER NOT NULL DEFAULT 1,
    "maxQty" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MonsterLootEntry_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterLootEntry" ("chance", "id", "itemId", "monsterId") SELECT "chance", "id", "itemId", "monsterId" FROM "MonsterLootEntry";
DROP TABLE "MonsterLootEntry";
ALTER TABLE "new_MonsterLootEntry" RENAME TO "MonsterLootEntry";
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
INSERT INTO "new_QuestTemplate" ("description", "filePath", "id", "name") SELECT "description", "filePath", "id", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
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
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'COLLECTION',
    "filePath" TEXT NOT NULL DEFAULT 'jobs/misc.json'
);
INSERT INTO "new_JobTemplate" ("category", "description", "id", "name") SELECT "category", "description", "id", "name" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
CREATE TABLE "new_UserQuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userQuestId" INTEGER NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "currentAmount" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserQuestObjective_userQuestId_fkey" FOREIGN KEY ("userQuestId") REFERENCES "UserQuest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuestObjective_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "QuestObjective" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserQuestObjective" ("currentAmount", "id", "objectiveId", "userQuestId") SELECT "currentAmount", "id", "objectiveId", "userQuestId" FROM "UserQuestObjective";
DROP TABLE "UserQuestObjective";
ALTER TABLE "new_UserQuestObjective" RENAME TO "UserQuestObjective";
CREATE UNIQUE INDEX "UserQuestObjective_userQuestId_objectiveId_key" ON "UserQuestObjective"("userQuestId", "objectiveId");
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "filePath" TEXT NOT NULL DEFAULT 'guilds/misc.json'
);
INSERT INTO "new_GuildTemplate" ("description", "filePath", "id", "name") SELECT "description", "filePath", "id", "name" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_AchievementTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "points" INTEGER NOT NULL DEFAULT 10,
    "filePath" TEXT NOT NULL DEFAULT 'achievements/misc.json'
);
INSERT INTO "new_AchievementTemplate" ("id", "name") SELECT "id", "name" FROM "AchievementTemplate";
DROP TABLE "AchievementTemplate";
ALTER TABLE "new_AchievementTemplate" RENAME TO "AchievementTemplate";
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
CREATE TABLE "new_RecipeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'SMITHING',
    "resultItemId" INTEGER NOT NULL,
    "resultQuantity" INTEGER NOT NULL DEFAULT 1,
    "goldCost" INTEGER NOT NULL DEFAULT 0,
    "requiredFame" INTEGER NOT NULL DEFAULT 0,
    "requiredJobId" INTEGER,
    "minJobLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredBuildingId" INTEGER,
    "baseSuccessRate" REAL NOT NULL DEFAULT 1.0,
    "filePath" TEXT NOT NULL DEFAULT 'recipes/misc.json',
    CONSTRAINT "RecipeTemplate_resultItemId_fkey" FOREIGN KEY ("resultItemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeTemplate" ("id", "name", "resultItemId") SELECT "id", "name", "resultItemId" FROM "RecipeTemplate";
DROP TABLE "RecipeTemplate";
ALTER TABLE "new_RecipeTemplate" RENAME TO "RecipeTemplate";
CREATE TABLE "new_DialogueTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'dialogues/misc.json'
);
INSERT INTO "new_DialogueTemplate" ("id", "npcId") SELECT "id", "npcId" FROM "DialogueTemplate";
DROP TABLE "DialogueTemplate";
ALTER TABLE "new_DialogueTemplate" RENAME TO "DialogueTemplate";
CREATE TABLE "new_MailAttachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mailId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MailAttachment_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MailAttachment" ("id", "mailId", "templateId") SELECT "id", "mailId", "templateId" FROM "MailAttachment";
DROP TABLE "MailAttachment";
ALTER TABLE "new_MailAttachment" RENAME TO "MailAttachment";
CREATE TABLE "new_BehaviourTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'behaviors/misc.json'
);
INSERT INTO "new_BehaviourTemplate" ("id", "name") SELECT "id", "name" FROM "BehaviourTemplate";
DROP TABLE "BehaviourTemplate";
ALTER TABLE "new_BehaviourTemplate" RENAME TO "BehaviourTemplate";
CREATE TABLE "new_StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'effects/misc.json'
);
INSERT INTO "new_StatusEffectTemplate" ("id", "name") SELECT "id", "name" FROM "StatusEffectTemplate";
DROP TABLE "StatusEffectTemplate";
ALTER TABLE "new_StatusEffectTemplate" RENAME TO "StatusEffectTemplate";
CREATE TABLE "new_BuildingTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'ECONOMY',
    "filePath" TEXT NOT NULL DEFAULT 'buildings/misc.json'
);
INSERT INTO "new_BuildingTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "BuildingTemplate";
DROP TABLE "BuildingTemplate";
ALTER TABLE "new_BuildingTemplate" RENAME TO "BuildingTemplate";
CREATE TABLE "new_BuildingInstance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuildingInstance_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BuildingInstance" ("id", "level", "regionId", "templateId") SELECT "id", "level", "regionId", "templateId" FROM "BuildingInstance";
DROP TABLE "BuildingInstance";
ALTER TABLE "new_BuildingInstance" RENAME TO "BuildingInstance";
CREATE TABLE "new_TraitTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "type" TEXT NOT NULL DEFAULT 'NATURAL',
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "filePath" TEXT NOT NULL DEFAULT 'traits/misc.json'
);
INSERT INTO "new_TraitTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "TraitTemplate";
DROP TABLE "TraitTemplate";
ALTER TABLE "new_TraitTemplate" RENAME TO "TraitTemplate";
CREATE TABLE "new_SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'skills/misc.json'
);
INSERT INTO "new_SkillTemplate" ("id") SELECT "id" FROM "SkillTemplate";
DROP TABLE "SkillTemplate";
ALTER TABLE "new_SkillTemplate" RENAME TO "SkillTemplate";
CREATE TABLE "new_ClassTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "filePath" TEXT NOT NULL DEFAULT 'classes/misc.json'
);
INSERT INTO "new_ClassTemplate" ("filePath", "id", "name", "tier") SELECT "filePath", "id", "name", "tier" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
