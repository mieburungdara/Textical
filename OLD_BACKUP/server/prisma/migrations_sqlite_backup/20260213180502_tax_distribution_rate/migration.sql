-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Territory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "guildId" INTEGER NOT NULL,
    "fortification" INTEGER NOT NULL DEFAULT 1000,
    "maxFortification" INTEGER NOT NULL DEFAULT 1000,
    "siegeStatus" TEXT NOT NULL DEFAULT 'PEACE',
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpkeepAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthlyQuestProgress" INTEGER NOT NULL DEFAULT 0,
    "monthlyQuestQuota" INTEGER NOT NULL DEFAULT 10,
    "maintenanceCost" INTEGER NOT NULL DEFAULT 1000,
    "taxDistributionRate" REAL NOT NULL DEFAULT 0.5,
    "nextMaintenanceAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Territory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Territory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Territory" ("capturedAt", "fortification", "guildId", "id", "lastUpkeepAt", "maintenanceCost", "maxFortification", "monthlyQuestProgress", "monthlyQuestQuota", "nextMaintenanceAt", "regionId", "siegeStatus") SELECT "capturedAt", "fortification", "guildId", "id", "lastUpkeepAt", "maintenanceCost", "maxFortification", "monthlyQuestProgress", "monthlyQuestQuota", "nextMaintenanceAt", "regionId", "siegeStatus" FROM "Territory";
DROP TABLE "Territory";
ALTER TABLE "new_Territory" RENAME TO "Territory";
CREATE UNIQUE INDEX "Territory_regionId_key" ON "Territory"("regionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
