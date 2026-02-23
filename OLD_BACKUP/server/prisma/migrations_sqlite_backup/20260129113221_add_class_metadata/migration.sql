-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "resourceType" TEXT NOT NULL DEFAULT 'MANA',
    "focus" TEXT NOT NULL DEFAULT 'General',
    "identity" TEXT NOT NULL DEFAULT 'A versatile starting point.',
    "growthDesc" TEXT NOT NULL DEFAULT 'Balanced growth across all stats.',
    "mechanicDesc" TEXT NOT NULL DEFAULT 'Uses standard Mana.',
    "leadsTo" TEXT NOT NULL DEFAULT '',
    "hpGrowth" REAL NOT NULL DEFAULT 5,
    "mpGrowth" REAL NOT NULL DEFAULT 2,
    "atkGrowth" REAL NOT NULL DEFAULT 1,
    "defGrowth" REAL NOT NULL DEFAULT 0.5,
    "spdGrowth" REAL NOT NULL DEFAULT 0.1,
    "promotionReqLevel" INTEGER NOT NULL DEFAULT 20,
    "parentClassId" INTEGER
);
INSERT INTO "new_ClassTemplate" ("atkGrowth", "defGrowth", "hpGrowth", "id", "mpGrowth", "name", "parentClassId", "promotionReqLevel", "resourceType", "spdGrowth", "tier") SELECT "atkGrowth", "defGrowth", "hpGrowth", "id", "mpGrowth", "name", "parentClassId", "promotionReqLevel", "resourceType", "spdGrowth", "tier" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
