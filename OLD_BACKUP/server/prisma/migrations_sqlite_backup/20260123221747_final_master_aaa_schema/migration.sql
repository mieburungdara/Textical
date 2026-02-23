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
CREATE TABLE "new_RegionTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TOWN',
    "coordinates" TEXT NOT NULL DEFAULT '{"x": 0, "y": 0}',
    "connections" TEXT NOT NULL DEFAULT '[]',
    "environment" TEXT NOT NULL DEFAULT '{}',
    "economy" TEXT NOT NULL DEFAULT '{}',
    "resourceYield" TEXT NOT NULL DEFAULT '[]',
    "encounterPool" TEXT NOT NULL DEFAULT '[]',
    "entryReqs" TEXT NOT NULL DEFAULT '{}',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "backgroundPath" TEXT NOT NULL DEFAULT 'res://assets/backgrounds/default.png',
    "musicTrack" TEXT NOT NULL DEFAULT 'default_theme',
    "filePath" TEXT NOT NULL DEFAULT 'regions/misc.json'
);
INSERT INTO "new_RegionTemplate" ("connections", "description", "filePath", "id", "name", "type") SELECT "connections", "description", "filePath", "id", "name", "type" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
