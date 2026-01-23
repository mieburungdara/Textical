-- CreateTable
CREATE TABLE "ItemTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "subCategory" TEXT NOT NULL DEFAULT 'MISC',
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

-- CreateTable
CREATE TABLE "ItemSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "setBonuses" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "ItemAffix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PREFIX',
    "modifiers" TEXT NOT NULL DEFAULT '{}',
    "allowedCategories" TEXT NOT NULL DEFAULT '[]',
    "minItemLevel" INTEGER NOT NULL DEFAULT 1,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON'
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "uniqueData" TEXT NOT NULL DEFAULT '{}',
    "sockets" TEXT NOT NULL DEFAULT '[]',
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "ownerHeroId" TEXT,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("id", "isEquipped", "quantity", "templateId", "uniqueData", "userId") SELECT "id", "isEquipped", "quantity", "templateId", "uniqueData", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
