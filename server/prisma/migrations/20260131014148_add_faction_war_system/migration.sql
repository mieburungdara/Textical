-- CreateTable
CREATE TABLE "FactionRelation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factionAId" INTEGER NOT NULL,
    "factionBId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEUTRAL',
    CONSTRAINT "FactionRelation_factionAId_fkey" FOREIGN KEY ("factionAId") REFERENCES "Faction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FactionRelation_factionBId_fkey" FOREIGN KEY ("factionBId") REFERENCES "Faction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "factionId" INTEGER,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Guild_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("gatheringTaxRate", "id", "marketTaxRate", "name", "templateId", "treasury", "vaultGold") SELECT "gatheringTaxRate", "id", "marketTaxRate", "name", "templateId", "treasury", "vaultGold" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "FactionRelation_factionAId_factionBId_key" ON "FactionRelation"("factionAId", "factionBId");
