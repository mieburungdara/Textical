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
    "hardness" INTEGER NOT NULL DEFAULT 1,
    "elementalAffinity" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_ItemTemplate" ("baseValue", "category", "description", "id", "isTwoHanded", "name", "rarity") SELECT "baseValue", "category", "description", "id", "isTwoHanded", "name", "rarity" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
