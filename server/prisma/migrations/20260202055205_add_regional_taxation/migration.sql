-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visualType" TEXT NOT NULL DEFAULT 'TOWN',
    "zoneType" TEXT NOT NULL DEFAULT 'GREEN',
    "regionalTaxRate" REAL NOT NULL DEFAULT 0.10,
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "factionId" INTEGER,
    CONSTRAINT "RegionTemplate_visualType_fkey" FOREIGN KEY ("visualType") REFERENCES "RegionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("dangerLevel", "description", "factionId", "id", "name", "visualType", "zoneType") SELECT "dangerLevel", "description", "factionId", "id", "name", "visualType", "zoneType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
