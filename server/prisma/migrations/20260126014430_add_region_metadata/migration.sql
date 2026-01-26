-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TOWN',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "metadata" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_RegionTemplate" ("dangerLevel", "description", "id", "name", "type") SELECT "dangerLevel", "description", "id", "name", "type" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
