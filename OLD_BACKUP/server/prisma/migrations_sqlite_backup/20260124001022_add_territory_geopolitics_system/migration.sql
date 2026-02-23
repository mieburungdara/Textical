-- CreateTable
CREATE TABLE "Siege" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "attackerGuildId" INTEGER NOT NULL,
    "defenderGuildId" INTEGER,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "winnerGuildId" INTEGER,
    "warLog" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Siege_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Siege_attackerGuildId_fkey" FOREIGN KEY ("attackerGuildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Siege_defenderGuildId_fkey" FOREIGN KEY ("defenderGuildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemAffix" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TOWN',
    "ownerGuildId" INTEGER,
    "localTaxRate" REAL NOT NULL DEFAULT 0.02,
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
    "filePath" TEXT NOT NULL DEFAULT 'regions/misc.json',
    CONSTRAINT "RegionTemplate_ownerGuildId_fkey" FOREIGN KEY ("ownerGuildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("backgroundPath", "connections", "coordinates", "dangerLevel", "description", "economy", "encounterPool", "entryReqs", "environment", "filePath", "id", "musicTrack", "name", "resourceYield", "type") SELECT "backgroundPath", "connections", "coordinates", "dangerLevel", "description", "economy", "encounterPool", "entryReqs", "environment", "filePath", "id", "musicTrack", "name", "resourceYield", "type" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    "taxIncomeTotal" BIGINT NOT NULL DEFAULT 0,
    "unlockedPerks" TEXT NOT NULL DEFAULT '[]',
    "facilities" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("createdAt", "description", "exp", "facilities", "id", "level", "name", "templateId", "unlockedPerks", "vaultGold") SELECT "createdAt", "description", "exp", "facilities", "id", "level", "name", "templateId", "unlockedPerks", "vaultGold" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
