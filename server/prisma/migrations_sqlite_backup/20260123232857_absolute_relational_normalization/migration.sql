/*
  Warnings:

  - You are about to drop the `ItemAffix` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `specialSpawns` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `MarketListing` table. All the data in the column will be lost.
  - You are about to drop the column `ingredients` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `acquiredTraits` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `classTier` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `naturalTraits` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `unlockedBehaviors` on the `Hero` table. All the data in the column will be lost.
  - You are about to alter the column `activeBehavior` on the `Hero` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `setBonuses` on the `ItemSet` table. All the data in the column will be lost.
  - You are about to drop the column `objectives` on the `QuestTemplate` table. All the data in the column will be lost.
  - Made the column `description` on table `GuildTemplate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemAffix";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipeId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "RecipeTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    CONSTRAINT "QuestObjective_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventSpawn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "spawnChance" REAL NOT NULL,
    "locationId" INTEGER,
    CONSTRAINT "EventSpawn_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "GlobalEventTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemSetBonus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setId" INTEGER NOT NULL,
    "requiredCount" INTEGER NOT NULL,
    "statModifiers" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "ItemSetBonus_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ItemSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroTrait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    "isNatural" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "HeroTrait_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroBehavior" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "behaviorId" INTEGER NOT NULL,
    CONSTRAINT "HeroBehavior_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroBehavior_behaviorId_fkey" FOREIGN KEY ("behaviorId") REFERENCES "BehaviourTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GlobalEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'WEATHER',
    "triggerType" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "worldModifiers" TEXT NOT NULL DEFAULT '{}',
    "combatModifiers" TEXT NOT NULL DEFAULT '{}',
    "targetScope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/events/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'events/misc.json'
);
INSERT INTO "new_GlobalEventTemplate" ("category", "combatModifiers", "description", "filePath", "iconPath", "id", "name", "targetScope", "triggerType", "worldModifiers") SELECT "category", "combatModifiers", "description", "filePath", "iconPath", "id", "name", "targetScope", "triggerType", "worldModifiers" FROM "GlobalEventTemplate";
DROP TABLE "GlobalEventTemplate";
ALTER TABLE "new_GlobalEventTemplate" RENAME TO "GlobalEventTemplate";
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePerks" TEXT NOT NULL DEFAULT '{}',
    "progressionTree" TEXT NOT NULL DEFAULT '[]',
    "creationReqs" TEXT NOT NULL DEFAULT '{}',
    "primaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/guilds/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'guilds/misc.json'
);
INSERT INTO "new_GuildTemplate" ("basePerks", "creationReqs", "description", "filePath", "iconPath", "id", "name", "primaryColor", "progressionTree") SELECT "basePerks", "creationReqs", "description", "filePath", "iconPath", "id", "name", "primaryColor", "progressionTree" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_MarketListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "isSold" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MarketListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MarketListing" ("createdAt", "expiresAt", "id", "isSold", "itemInstanceId", "pricePerUnit", "sellerId", "templateId", "totalPrice") SELECT "createdAt", "expiresAt", "id", "isSold", "itemInstanceId", "pricePerUnit", "sellerId", "templateId", "totalPrice" FROM "MarketListing";
DROP TABLE "MarketListing";
ALTER TABLE "new_MarketListing" RENAME TO "MarketListing";
CREATE UNIQUE INDEX "MarketListing_itemInstanceId_key" ON "MarketListing"("itemInstanceId");
CREATE TABLE "new_RecipeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SMITHING',
    "resultItemId" INTEGER NOT NULL,
    "resultQuantity" INTEGER NOT NULL DEFAULT 1,
    "goldCost" INTEGER NOT NULL DEFAULT 0,
    "requiredFame" INTEGER NOT NULL DEFAULT 0,
    "requiredJobId" INTEGER,
    "minJobLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredBuildingId" INTEGER,
    "baseSuccessRate" REAL NOT NULL DEFAULT 1.0,
    "filePath" TEXT NOT NULL DEFAULT 'recipes/misc.json'
);
INSERT INTO "new_RecipeTemplate" ("baseSuccessRate", "category", "description", "filePath", "goldCost", "id", "minJobLevel", "name", "requiredBuildingId", "requiredFame", "requiredJobId", "resultItemId", "resultQuantity") SELECT "baseSuccessRate", "category", "description", "filePath", "goldCost", "id", "minJobLevel", "name", "requiredBuildingId", "requiredFame", "requiredJobId", "resultItemId", "resultQuantity" FROM "RecipeTemplate";
DROP TABLE "RecipeTemplate";
ALTER TABLE "new_RecipeTemplate" RENAME TO "RecipeTemplate";
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classId" INTEGER NOT NULL DEFAULT 1001,
    "jobId" INTEGER,
    "jobLevel" INTEGER NOT NULL DEFAULT 1,
    "jobExp" INTEGER NOT NULL DEFAULT 0,
    "jobRank" TEXT NOT NULL DEFAULT 'APPRENTICE',
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "activeBehavior" INTEGER NOT NULL DEFAULT 6001,
    "deeds" TEXT NOT NULL DEFAULT '{}',
    "hasReproduced" BOOLEAN NOT NULL DEFAULT false,
    "fatherId" INTEGER,
    "motherId" INTEGER,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "equipment" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("activeBehavior", "baseStats", "classId", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "motherId", "name", "race", "userId") SELECT "activeBehavior", "baseStats", "classId", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "motherId", "name", "race", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_ItemSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_ItemSet" ("description", "id", "name") SELECT "description", "id", "name" FROM "ItemSet";
DROP TABLE "ItemSet";
ALTER TABLE "new_ItemSet" RENAME TO "ItemSet";
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SIDE',
    "difficulty" TEXT NOT NULL DEFAULT 'NORMAL',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "prerequisiteQuestId" INTEGER,
    "logicBranches" TEXT NOT NULL DEFAULT '{}',
    "rewards" TEXT NOT NULL DEFAULT '{}',
    "isTimeLimited" BOOLEAN NOT NULL DEFAULT false,
    "expiryHours" INTEGER NOT NULL DEFAULT 0,
    "requiredRegion" INTEGER,
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/quests/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'quests/misc.json'
);
INSERT INTO "new_QuestTemplate" ("category", "description", "difficulty", "expiryHours", "filePath", "iconPath", "id", "isTimeLimited", "logicBranches", "minLevel", "name", "prerequisiteQuestId", "requiredRegion", "rewards") SELECT "category", "description", "difficulty", "expiryHours", "filePath", "iconPath", "id", "isTimeLimited", "logicBranches", "minLevel", "name", "prerequisiteQuestId", "requiredRegion", "rewards" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
