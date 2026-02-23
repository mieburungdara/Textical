-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "subCategory" TEXT NOT NULL DEFAULT 'MISC',
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/items/default.png',
    "baseDurability" INTEGER NOT NULL DEFAULT 100,
    "repairCostPerPt" INTEGER NOT NULL DEFAULT 1,
    "maxSockets" INTEGER NOT NULL DEFAULT 0,
    "allowedSockets" TEXT NOT NULL DEFAULT '[]',
    "isCraftable" BOOLEAN NOT NULL DEFAULT true,
    "salvageResult" TEXT NOT NULL DEFAULT '[]',
    "setId" INTEGER,
    "filePath" TEXT NOT NULL DEFAULT 'items/misc.json',
    CONSTRAINT "ItemTemplate_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ItemSet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("allowedSockets", "baseDurability", "category", "description", "filePath", "id", "isCraftable", "maxSockets", "name", "rarity", "repairCostPerPt", "salvageResult", "setId", "subCategory") SELECT "allowedSockets", "baseDurability", "category", "description", "filePath", "id", "isCraftable", "maxSockets", "name", "rarity", "repairCostPerPt", "salvageResult", "setId", "subCategory" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
