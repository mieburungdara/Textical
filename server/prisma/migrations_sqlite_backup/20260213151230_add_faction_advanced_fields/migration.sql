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
    "reputationRequirement" INTEGER NOT NULL DEFAULT 0,
    "factionTributeRate" REAL NOT NULL DEFAULT 0.0,
    "regionTypeId" TEXT,
    "factionId" INTEGER,
    "gridX" INTEGER NOT NULL DEFAULT 0,
    "gridY" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RegionTemplate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "RegionArea" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("ambientSfxPack", "areaId", "description", "discoveryXp", "eliteSpawnChance", "factionId", "flavorText", "gridX", "gridY", "id", "isDiscoveryPoint", "isSafeZone", "landmarkName", "maxPartyUnits", "minRequiredHeroLevel", "minRequiredUnits", "minimapIcon", "name", "regionTypeId", "regionalTaxRate", "requiredAchievementId", "requiredLevel", "resourceModifier", "respawnPenaltyMult", "spawnRateMultiplier", "specialization", "teleportCostMultiplier", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType") SELECT "ambientSfxPack", "areaId", "description", "discoveryXp", "eliteSpawnChance", "factionId", "flavorText", "gridX", "gridY", "id", "isDiscoveryPoint", "isSafeZone", "landmarkName", "maxPartyUnits", "minRequiredHeroLevel", "minRequiredUnits", "minimapIcon", "name", "regionTypeId", "regionalTaxRate", "requiredAchievementId", "requiredLevel", "resourceModifier", "respawnPenaltyMult", "spawnRateMultiplier", "specialization", "teleportCostMultiplier", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
