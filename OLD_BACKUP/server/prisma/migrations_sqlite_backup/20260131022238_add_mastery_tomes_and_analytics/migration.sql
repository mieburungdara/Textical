-- CreateTable
CREATE TABLE "HeroSaleHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classId" INTEGER NOT NULL,
    "unitLevel" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "soldAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HeroSaleHistory_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroSaleHistory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "isTwoHanded" BOOLEAN NOT NULL DEFAULT false,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "hardness" INTEGER NOT NULL DEFAULT 1,
    "minStr" INTEGER NOT NULL DEFAULT 0,
    "minToolTier" INTEGER NOT NULL DEFAULT 0,
    "toolTier" INTEGER NOT NULL DEFAULT 0,
    "elementalAffinity" INTEGER NOT NULL DEFAULT 0,
    "masteryClassId" INTEGER,
    "masteryXpAmount" INTEGER,
    CONSTRAINT "ItemTemplate_masteryClassId_fkey" FOREIGN KEY ("masteryClassId") REFERENCES "ClassTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("baseValue", "category", "description", "elementalAffinity", "hardness", "id", "isTwoHanded", "maxStack", "minStr", "minToolTier", "name", "rarity", "toolTier") SELECT "baseValue", "category", "description", "elementalAffinity", "hardness", "id", "isTwoHanded", "maxStack", "minStr", "minToolTier", "name", "rarity", "toolTier" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
