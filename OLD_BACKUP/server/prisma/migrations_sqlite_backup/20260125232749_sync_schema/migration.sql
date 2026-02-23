/*
  Warnings:

  - You are about to drop the `AchievementTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BehaviourTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BuildingInstance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BuildingPerk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BuildingTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BuildingUpgrade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassPromotionPath` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassSkillUnlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassStatGrowth` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DialogueTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventSpawn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GlobalEventTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HallOfFame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroAuctionListing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroBehavior` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroBid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroDeed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroStat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemAllowedSocket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemRequirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemSalvageEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemSetBonus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MailAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MarketHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MonsterTraitUnlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestBranch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RaceBonusTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RaceStatBonus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkillTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatusEffectTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TraitStatModifier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserQuestObjective` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `category` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `expiryHours` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isTimeLimited` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `minLevel` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `prerequisiteQuestId` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredRegion` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `tier` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `copper` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fame` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `guildRole` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mithril` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `platinum` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `silver` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `maxQty` on the `MonsterLootEntry` table. All the data in the column will be lost.
  - You are about to drop the column `minQty` on the `MonsterLootEntry` table. All the data in the column will be lost.
  - You are about to drop the column `gatherDifficulty` on the `RegionResource` table. All the data in the column will be lost.
  - You are about to drop the column `requiredJobId` on the `RegionResource` table. All the data in the column will be lost.
  - You are about to drop the column `spawnChance` on the `RegionResource` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `baseDurability` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isCraftable` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `maxSockets` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `repairCostPerPt` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `setId` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `subCategory` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundPath` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `localTaxRate` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `musicTrack` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `ownerGuildId` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `defenderGuildId` on the `Siege` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `currentDurability` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `SiegeLog` table. All the data in the column will be lost.
  - You are about to drop the column `taxIncomeTotal` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `exp` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `gridX` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `gridY` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `jobExp` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `jobLevel` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `jobRank` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `masteryPoints` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `QuestReward` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `MarketListing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `RecipeTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "HeroAuctionListing_heroId_key";

-- DropIndex
DROP INDEX "HeroBehavior_heroId_behaviorId_key";

-- DropIndex
DROP INDEX "HeroDeed_heroId_deedKey_key";

-- DropIndex
DROP INDEX "HeroStat_heroId_statKey_key";

-- DropIndex
DROP INDEX "HeroTrait_heroId_traitId_key";

-- DropIndex
DROP INDEX "UserAchievement_userId_achievementId_key";

-- DropIndex
DROP INDEX "UserQuest_userId_questId_key";

-- DropIndex
DROP INDEX "UserQuestObjective_userQuestId_objectiveId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AchievementTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BehaviourTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BuildingInstance";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BuildingPerk";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BuildingTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BuildingUpgrade";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClassPromotionPath";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClassSkillUnlock";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClassStatGrowth";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DialogueTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EventSpawn";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GlobalEventTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HallOfFame";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HeroAuctionListing";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HeroBehavior";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HeroBid";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HeroDeed";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HeroStat";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemAllowedSocket";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemRequirement";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemSalvageEntry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemSet";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemSetBonus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MailAttachment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MarketHistory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MonsterTraitUnlock";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "QuestBranch";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RaceBonusTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RaceStatBonus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SkillTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StatusEffectTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TraitStatModifier";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserAchievement";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserQuestObjective";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TavernMercenary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "recruitmentCost" INTEGER NOT NULL DEFAULT 100,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "TavernMercenary_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TavernMercenary_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemTrait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    CONSTRAINT "ItemTrait_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemEquipSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "slotKey" TEXT NOT NULL,
    CONSTRAINT "ItemEquipSlot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskQueue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "heroId" INTEGER,
    "type" TEXT NOT NULL,
    "targetItemId" INTEGER,
    "originRegionId" INTEGER,
    "targetRegionId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "finishesAt" DATETIME,
    CONSTRAINT "TaskQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskQueue_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TaskQueue_targetItemId_fkey" FOREIGN KEY ("targetItemId") REFERENCES "ItemTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TaskQueue_originRegionId_fkey" FOREIGN KEY ("originRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TaskQueue_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormationPreset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "FormationPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormationSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "presetId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "gridX" INTEGER NOT NULL,
    "gridY" INTEGER NOT NULL,
    CONSTRAINT "FormationSlot_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "FormationPreset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormationSlot_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PremiumTierTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "queueSlots" INTEGER NOT NULL DEFAULT 0,
    "speedBonus" REAL NOT NULL DEFAULT 0.0,
    "vitalityRegenMult" REAL NOT NULL DEFAULT 1.0,
    "maxVitalityBonus" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_QuestTemplate" ("description", "id", "name") SELECT "description", "id", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
CREATE TABLE "new_ClassTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_ClassTemplate" ("id", "name") SELECT "id", "name" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "vitality" INTEGER NOT NULL DEFAULT 100,
    "maxVitality" INTEGER NOT NULL DEFAULT 100,
    "lastVitalityUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxInventorySlots" INTEGER NOT NULL DEFAULT 20,
    "currentRegion" INTEGER NOT NULL DEFAULT 1,
    "tavernTimeSecondsToday" INTEGER NOT NULL DEFAULT 0,
    "lastTavernResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastQuestResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tavernEntryAt" DATETIME,
    "isInTavern" BOOLEAN NOT NULL DEFAULT false,
    "premiumTierId" INTEGER NOT NULL DEFAULT 0,
    "guildId" INTEGER,
    CONSTRAINT "User_premiumTierId_fkey" FOREIGN KEY ("premiumTierId") REFERENCES "PremiumTierTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("currentRegion", "gold", "guildId", "id", "password", "username") SELECT "currentRegion", "gold", "guildId", "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_GuildTemplate" ("id", "name") SELECT "id", "name" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_HeroEquipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "slotKey" TEXT NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,
    CONSTRAINT "HeroEquipment_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroEquipment_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroEquipment" ("heroId", "id", "itemInstanceId", "slotKey") SELECT "heroId", "id", "itemInstanceId", "slotKey" FROM "HeroEquipment";
DROP TABLE "HeroEquipment";
ALTER TABLE "new_HeroEquipment" RENAME TO "HeroEquipment";
CREATE UNIQUE INDEX "HeroEquipment_itemInstanceId_key" ON "HeroEquipment"("itemInstanceId");
CREATE TABLE "new_MonsterLootEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "chance" REAL NOT NULL,
    CONSTRAINT "MonsterLootEntry_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterLootEntry" ("chance", "id", "itemId", "monsterId") SELECT "chance", "id", "itemId", "monsterId" FROM "MonsterLootEntry";
DROP TABLE "MonsterLootEntry";
ALTER TABLE "new_MonsterLootEntry" RENAME TO "MonsterLootEntry";
CREATE TABLE "new_RegionResource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "gatherTimeSeconds" INTEGER NOT NULL DEFAULT 10,
    CONSTRAINT "RegionResource_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionResource_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegionResource" ("id", "itemId", "regionId") SELECT "id", "itemId", "regionId" FROM "RegionResource";
DROP TABLE "RegionResource";
ALTER TABLE "new_RegionResource" RENAME TO "RegionResource";
CREATE TABLE "new_MarketListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "MarketListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MarketListing" ("id", "itemInstanceId", "pricePerUnit", "sellerId", "templateId") SELECT "id", "itemInstanceId", "pricePerUnit", "sellerId", "templateId" FROM "MarketListing";
DROP TABLE "MarketListing";
ALTER TABLE "new_MarketListing" RENAME TO "MarketListing";
CREATE UNIQUE INDEX "MarketListing_itemInstanceId_key" ON "MarketListing"("itemInstanceId");
CREATE TABLE "new_JobTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COLLECTION'
);
INSERT INTO "new_JobTemplate" ("category", "id", "name") SELECT "category", "id", "name" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "isTwoHanded" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ItemTemplate" ("category", "description", "id", "name", "rarity") SELECT "category", "description", "id", "name", "rarity" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
CREATE TABLE "new_RegionConnection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originRegionId" INTEGER NOT NULL,
    "targetRegionId" INTEGER NOT NULL,
    "travelTimeSeconds" INTEGER NOT NULL DEFAULT 15,
    CONSTRAINT "RegionConnection_originRegionId_fkey" FOREIGN KEY ("originRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionConnection_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegionConnection" ("id", "originRegionId", "targetRegionId") SELECT "id", "originRegionId", "targetRegionId" FROM "RegionConnection";
DROP TABLE "RegionConnection";
ALTER TABLE "new_RegionConnection" RENAME TO "RegionConnection";
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TOWN',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_RegionTemplate" ("dangerLevel", "description", "id", "name", "type") SELECT "dangerLevel", "description", "id", "name", "type" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_Siege" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "attackerGuildId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);
INSERT INTO "new_Siege" ("attackerGuildId", "id", "regionId", "status") SELECT "attackerGuildId", "id", "regionId", "status" FROM "Siege";
DROP TABLE "Siege";
ALTER TABLE "new_Siege" RENAME TO "Siege";
CREATE TABLE "new_TraitTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'GENERAL'
);
INSERT INTO "new_TraitTemplate" ("description", "id", "name") SELECT "description", "id", "name" FROM "TraitTemplate";
DROP TABLE "TraitTemplate";
ALTER TABLE "new_TraitTemplate" RENAME TO "TraitTemplate";
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "hp_base", "id", "name") SELECT "categoryId", "damage_base", "hp_base", "id", "name" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("id", "quantity", "templateId", "userId") SELECT "id", "quantity", "templateId", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE UNIQUE INDEX "InventoryItem_userId_templateId_key" ON "InventoryItem"("userId", "templateId");
CREATE TABLE "new_Mail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiverId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Mail_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mail" ("expiresAt", "id", "receiverId", "subject") SELECT "expiresAt", "id", "receiverId", "subject" FROM "Mail";
DROP TABLE "Mail";
ALTER TABLE "new_Mail" RENAME TO "Mail";
CREATE TABLE "new_QuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    CONSTRAINT "QuestObjective_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuestObjective" ("amount", "description", "id", "questId", "targetId", "type") SELECT "amount", "description", "id", "questId", "targetId", "type" FROM "QuestObjective";
DROP TABLE "QuestObjective";
ALTER TABLE "new_QuestObjective" RENAME TO "QuestObjective";
CREATE TABLE "new_SiegeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siegeId" INTEGER NOT NULL,
    "event" TEXT NOT NULL
);
INSERT INTO "new_SiegeLog" ("event", "id", "siegeId") SELECT "event", "id", "siegeId" FROM "SiegeLog";
DROP TABLE "SiegeLog";
ALTER TABLE "new_SiegeLog" RENAME TO "SiegeLog";
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("id", "name", "templateId", "vaultGold") SELECT "id", "name", "templateId", "vaultGold" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "classId" INTEGER NOT NULL,
    "jobId" INTEGER,
    "vitality" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "id", "jobId", "level", "name", "userId") SELECT "classId", "id", "jobId", "level", "name", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_RecipeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resultItemId" INTEGER NOT NULL,
    "craftTimeSeconds" INTEGER NOT NULL DEFAULT 30,
    CONSTRAINT "RecipeTemplate_resultItemId_fkey" FOREIGN KEY ("resultItemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeTemplate" ("id", "name", "resultItemId") SELECT "id", "name", "resultItemId" FROM "RecipeTemplate";
DROP TABLE "RecipeTemplate";
ALTER TABLE "new_RecipeTemplate" RENAME TO "RecipeTemplate";
CREATE TABLE "new_QuestReward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "QuestReward_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuestReward" ("amount", "id", "questId", "type") SELECT "amount", "id", "questId", "type" FROM "QuestReward";
DROP TABLE "QuestReward";
ALTER TABLE "new_QuestReward" RENAME TO "QuestReward";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "TavernMercenary_heroId_key" ON "TavernMercenary"("heroId");

-- CreateIndex
CREATE UNIQUE INDEX "FormationSlot_presetId_gridX_gridY_key" ON "FormationSlot"("presetId", "gridX", "gridY");
