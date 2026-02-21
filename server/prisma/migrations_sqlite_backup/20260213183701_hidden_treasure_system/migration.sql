-- CreateTable
CREATE TABLE "HiddenTreasure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "treasureType" TEXT NOT NULL,
    "baseChance" REAL NOT NULL DEFAULT 0.05,
    "lootTableId" TEXT,
    "cooldownDays" INTEGER NOT NULL DEFAULT 7,
    "lastDiscoveredAt" DATETIME,
    "lastDiscoveredBy" INTEGER,
    "respawnAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HiddenTreasure_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HiddenTreasure_lastDiscoveredBy_fkey" FOREIGN KEY ("lastDiscoveredBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
