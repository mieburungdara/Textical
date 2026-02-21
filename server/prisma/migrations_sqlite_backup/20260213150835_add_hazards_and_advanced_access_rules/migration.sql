-- CreateTable
CREATE TABLE "HazardType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "RegionHazard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "hazardTypeId" INTEGER NOT NULL,
    "damage" REAL NOT NULL DEFAULT 10.0,
    "frequencySec" REAL NOT NULL DEFAULT 5.0,
    CONSTRAINT "RegionHazard_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionHazard_hazardTypeId_fkey" FOREIGN KEY ("hazardTypeId") REFERENCES "HazardType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visualType" TEXT NOT NULL DEFAULT 'TOWN',
    "traversalType" TEXT NOT NULL DEFAULT 'WALK',
    "zoneType" TEXT NOT NULL DEFAULT 'GREEN',
    "zoneLevel" INTEGER NOT NULL DEFAULT 1,
    "zoneColor" TEXT,
    "isSafeZone" BOOLEAN NOT NULL DEFAULT true,
    "regionalTaxRate" REAL NOT NULL DEFAULT 0.10,
    "weatherOverride" TEXT,
    "specialization" TEXT,
    "areaId" INTEGER,
    "isDiscoveryPoint" BOOLEAN NOT NULL DEFAULT true,
    "resourceModifier" REAL NOT NULL DEFAULT 1.0,
    "teleportCostMultiplier" REAL NOT NULL DEFAULT 1.0,
    "maxPartyUnits" INTEGER NOT NULL DEFAULT 100,
    "minimapIcon" TEXT,
    "ambientSfxPack" TEXT,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "respawnPenaltyMult" REAL NOT NULL DEFAULT 1.0,
    "landmarkName" TEXT,
    "flavorText" TEXT,
    "discoveryXp" INTEGER NOT NULL DEFAULT 100,
    "spawnRateMultiplier" REAL NOT NULL DEFAULT 1.0,
    "eliteSpawnChance" REAL NOT NULL DEFAULT 0.05,
    "minRequiredUnits" INTEGER NOT NULL DEFAULT 0,
    "minRequiredHeroLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredAchievementId" INTEGER,
    "regionTypeId" TEXT,
    "factionId" INTEGER,
    "gridX" INTEGER NOT NULL DEFAULT 0,
    "gridY" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RegionTemplate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "RegionArea" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("ambientSfxPack", "areaId", "description", "factionId", "gridX", "gridY", "id", "isDiscoveryPoint", "isSafeZone", "maxPartyUnits", "minimapIcon", "name", "regionTypeId", "regionalTaxRate", "requiredLevel", "resourceModifier", "respawnPenaltyMult", "specialization", "teleportCostMultiplier", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType") SELECT "ambientSfxPack", "areaId", "description", "factionId", "gridX", "gridY", "id", "isDiscoveryPoint", "isSafeZone", "maxPartyUnits", "minimapIcon", "name", "regionTypeId", "regionalTaxRate", "requiredLevel", "resourceModifier", "respawnPenaltyMult", "specialization", "teleportCostMultiplier", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "HazardType_name_key" ON "HazardType"("name");
