-- CreateTable
CREATE TABLE "WeaponType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "isTwoHanded" BOOLEAN NOT NULL DEFAULT false,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "isQuestItem" BOOLEAN NOT NULL DEFAULT false,
    "hardness" INTEGER NOT NULL DEFAULT 1,
    "minStr" INTEGER NOT NULL DEFAULT 0,
    "minToolTier" INTEGER NOT NULL DEFAULT 0,
    "toolTier" INTEGER NOT NULL DEFAULT 0,
    "elementalAffinity" INTEGER NOT NULL DEFAULT 0,
    "masteryClassId" INTEGER,
    "masteryXpAmount" INTEGER,
    "weaponTypeId" INTEGER,
    CONSTRAINT "ItemTemplate_masteryClassId_fkey" FOREIGN KEY ("masteryClassId") REFERENCES "ClassTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ItemTemplate_weaponTypeId_fkey" FOREIGN KEY ("weaponTypeId") REFERENCES "WeaponType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("baseValue", "category", "description", "elementalAffinity", "hardness", "id", "isQuestItem", "isTwoHanded", "masteryClassId", "masteryXpAmount", "maxStack", "minStr", "minToolTier", "name", "rarity", "toolTier", "version") SELECT "baseValue", "category", "description", "elementalAffinity", "hardness", "id", "isQuestItem", "isTwoHanded", "masteryClassId", "masteryXpAmount", "maxStack", "minStr", "minToolTier", "name", "rarity", "toolTier", "version" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WeaponType_name_key" ON "WeaponType"("name");


