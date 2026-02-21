-- CreateTable
CREATE TABLE "AudioTrack" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'BGM',
    "loops" BOOLEAN NOT NULL DEFAULT true
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
    "pvpMode" TEXT NOT NULL DEFAULT 'SAFE',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "hasInn" BOOLEAN NOT NULL DEFAULT false,
    "innTier" INTEGER NOT NULL DEFAULT 1,
    "regionCategory" TEXT,
    "isBanditHideout" BOOLEAN NOT NULL DEFAULT false,
    "monsterMigrationStatus" BOOLEAN NOT NULL DEFAULT false,
    "rareHerbSpawnChance" REAL NOT NULL DEFAULT 0.0,
    "mysticFogIntensity" REAL NOT NULL DEFAULT 0.0,
    "manaStaticIntensity" REAL NOT NULL DEFAULT 1.0,
    "ecologicalStress" REAL NOT NULL DEFAULT 0.0,
    "areaId" INTEGER,
    "isDiscoveryPoint" BOOLEAN NOT NULL DEFAULT true,
    "resourceModifier" REAL NOT NULL DEFAULT 1.0,
    "teleportCostMultiplier" REAL NOT NULL DEFAULT 1.0,
    "maxPartyUnits" INTEGER NOT NULL DEFAULT 100,
    "minimapIcon" TEXT,
    "ambientSfxPack" TEXT,
    "particleEffectPack" TEXT,
    "skyboxOverride" TEXT,
    "fogDensity" REAL NOT NULL DEFAULT 0.0,
    "gatheringStaminaCost" REAL NOT NULL DEFAULT 1.0,
    "mapMusicId" INTEGER,
    "regionLoreSnippet" TEXT,
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
    "elementalAffinity" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "terrainAttackMod" REAL NOT NULL DEFAULT 1.0,
    "terrainDefenseMod" REAL NOT NULL DEFAULT 1.0,
    "innRecoveryRate" REAL NOT NULL DEFAULT 1.0,
    "resourceScarcity" REAL NOT NULL DEFAULT 1.0,
    "marketDemandIndex" REAL NOT NULL DEFAULT 1.0,
    "blessingType" TEXT,
    "sanctuaryPower" REAL NOT NULL DEFAULT 0.0,
    "plotAvailability" INTEGER NOT NULL DEFAULT 0,
    "rentCostMultiplier" REAL NOT NULL DEFAULT 1.0,
    "guildBonusType" TEXT,
    "prestigePoints" INTEGER NOT NULL DEFAULT 0,
    "corruptionLevel" REAL NOT NULL DEFAULT 0.0,
    "dominanCaste" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "regionTypeId" TEXT,
    "factionId" INTEGER,
    "guildOwnershipId" INTEGER,
    "gridX" INTEGER NOT NULL DEFAULT 0,
    "gridY" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RegionTemplate_guildOwnershipId_fkey" FOREIGN KEY ("guildOwnershipId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_mapMusicId_fkey" FOREIGN KEY ("mapMusicId") REFERENCES "AudioTrack" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "RegionArea" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("ambientSfxPack", "areaId", "blessingType", "corruptionLevel", "dangerLevel", "description", "discoveryXp", "dominanCaste", "ecologicalStress", "elementalAffinity", "eliteSpawnChance", "factionId", "factionTributeRate", "flavorText", "fogDensity", "gatheringStaminaCost", "gridX", "gridY", "guildBonusType", "guildOwnershipId", "hasInn", "id", "innRecoveryRate", "innTier", "isBanditHideout", "isDiscoveryPoint", "isSafeZone", "landmarkName", "manaStaticIntensity", "marketDemandIndex", "maxPartyUnits", "minRequiredHeroLevel", "minRequiredUnits", "minimapIcon", "monsterMigrationStatus", "mysticFogIntensity", "name", "particleEffectPack", "plotAvailability", "prestigePoints", "pvpMode", "rareHerbSpawnChance", "regionCategory", "regionTypeId", "regionalTaxRate", "rentCostMultiplier", "reputationRequirement", "requiredAchievementId", "requiredLevel", "resourceModifier", "resourceScarcity", "respawnPenaltyMult", "sanctuaryPower", "skyboxOverride", "spawnRateMultiplier", "specialization", "teleportCostMultiplier", "terrainAttackMod", "terrainDefenseMod", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType") SELECT "ambientSfxPack", "areaId", "blessingType", "corruptionLevel", "dangerLevel", "description", "discoveryXp", "dominanCaste", "ecologicalStress", "elementalAffinity", "eliteSpawnChance", "factionId", "factionTributeRate", "flavorText", "fogDensity", "gatheringStaminaCost", "gridX", "gridY", "guildBonusType", "guildOwnershipId", "hasInn", "id", "innRecoveryRate", "innTier", "isBanditHideout", "isDiscoveryPoint", "isSafeZone", "landmarkName", "manaStaticIntensity", "marketDemandIndex", "maxPartyUnits", "minRequiredHeroLevel", "minRequiredUnits", "minimapIcon", "monsterMigrationStatus", "mysticFogIntensity", "name", "particleEffectPack", "plotAvailability", "prestigePoints", "pvpMode", "rareHerbSpawnChance", "regionCategory", "regionTypeId", "regionalTaxRate", "rentCostMultiplier", "reputationRequirement", "requiredAchievementId", "requiredLevel", "resourceModifier", "resourceScarcity", "respawnPenaltyMult", "sanctuaryPower", "skyboxOverride", "spawnRateMultiplier", "specialization", "teleportCostMultiplier", "terrainAttackMod", "terrainDefenseMod", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_WorldState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentHour" INTEGER NOT NULL DEFAULT 12,
    "weatherType" TEXT NOT NULL DEFAULT 'CLEAR',
    "moonPhase" TEXT NOT NULL DEFAULT 'NEW',
    "lastTick" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_WorldState" ("currentHour", "id", "lastTick", "moonPhase", "weatherType") SELECT "currentHour", "id", "lastTick", "moonPhase", "weatherType" FROM "WorldState";
DROP TABLE "WorldState";
ALTER TABLE "new_WorldState" RENAME TO "WorldState";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AudioTrack_name_path_key" ON "AudioTrack"("name", "path");
