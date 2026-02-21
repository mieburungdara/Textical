-- CreateTable
CREATE TABLE "Territory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "guildId" INTEGER NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpkeepAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Territory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Territory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    "treasury" INTEGER NOT NULL DEFAULT 0,
    "marketTaxRate" REAL NOT NULL DEFAULT 0.0,
    "gatheringTaxRate" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("id", "name", "templateId", "vaultGold") SELECT "id", "name", "templateId", "vaultGold" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Territory_regionId_key" ON "Territory"("regionId");
