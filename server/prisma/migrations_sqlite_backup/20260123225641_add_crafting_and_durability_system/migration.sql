/*
  Warnings:

  - You are about to drop the `DialogueTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatusEffectTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DialogueTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StatusEffectTemplate";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RecipeTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SMITHING',
    "resultItemId" TEXT NOT NULL,
    "resultQuantity" INTEGER NOT NULL DEFAULT 1,
    "ingredients" TEXT NOT NULL DEFAULT '[]',
    "goldCost" INTEGER NOT NULL DEFAULT 0,
    "requiredFame" INTEGER NOT NULL DEFAULT 0,
    "requiredJobId" TEXT,
    "minJobLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredBuildingId" TEXT,
    "baseSuccessRate" REAL NOT NULL DEFAULT 1.0,
    "filePath" TEXT NOT NULL DEFAULT 'recipes/misc.json'
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentDurability" INTEGER NOT NULL DEFAULT 100,
    "uniqueData" TEXT NOT NULL DEFAULT '{}',
    "sockets" TEXT NOT NULL DEFAULT '[]',
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "ownerHeroId" TEXT,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("id", "isEquipped", "ownerHeroId", "quantity", "sockets", "templateId", "uniqueData", "userId") SELECT "id", "isEquipped", "ownerHeroId", "quantity", "sockets", "templateId", "uniqueData", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_ItemTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "subCategory" TEXT NOT NULL DEFAULT 'MISC',
    "baseDurability" INTEGER NOT NULL DEFAULT 100,
    "repairCostPerPt" INTEGER NOT NULL DEFAULT 1,
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "maxSockets" INTEGER NOT NULL DEFAULT 0,
    "allowedSockets" TEXT NOT NULL DEFAULT '[]',
    "setId" TEXT,
    "isCraftable" BOOLEAN NOT NULL DEFAULT true,
    "salvageResult" TEXT NOT NULL DEFAULT '[]',
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/items/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'items/misc.json',
    CONSTRAINT "ItemTemplate_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ItemSet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("allowedSockets", "baseStats", "category", "description", "filePath", "iconPath", "id", "isCraftable", "maxSockets", "name", "rarity", "requirements", "salvageResult", "setId", "subCategory") SELECT "allowedSockets", "baseStats", "category", "description", "filePath", "iconPath", "id", "isCraftable", "maxSockets", "name", "rarity", "requirements", "salvageResult", "setId", "subCategory" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
CREATE TABLE "new_QuestTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SIDE',
    "difficulty" TEXT NOT NULL DEFAULT 'NORMAL',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "prerequisiteQuestId" TEXT,
    "objectives" TEXT NOT NULL DEFAULT '[]',
    "logicBranches" TEXT NOT NULL DEFAULT '{}',
    "rewards" TEXT NOT NULL DEFAULT '[]',
    "isTimeLimited" BOOLEAN NOT NULL DEFAULT false,
    "expiryHours" INTEGER NOT NULL DEFAULT 0,
    "requiredRegion" TEXT,
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/quests/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'quests/misc.json'
);
INSERT INTO "new_QuestTemplate" ("category", "description", "difficulty", "expiryHours", "filePath", "iconPath", "id", "isTimeLimited", "logicBranches", "minLevel", "name", "objectives", "prerequisiteQuestId", "requiredRegion", "rewards") SELECT "category", "description", "difficulty", "expiryHours", "filePath", "iconPath", "id", "isTimeLimited", "logicBranches", "minLevel", "name", "objectives", "prerequisiteQuestId", "requiredRegion", "rewards" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
