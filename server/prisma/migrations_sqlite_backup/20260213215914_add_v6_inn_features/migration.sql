-- CreateTable
CREATE TABLE "TavernRumor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 100,
    "reliabilityAt" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TavernRumor_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TavernRumor_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TavernRumorPurchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rumorId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "rating" INTEGER,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TavernRumorPurchase_rumorId_fkey" FOREIGN KEY ("rumorId") REFERENCES "TavernRumor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TavernRumorPurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TavernEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "regionId" INTEGER,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "buffMultiplier" REAL NOT NULL DEFAULT 1.5,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TavernEvent_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "ecologicalStress" REAL NOT NULL DEFAULT 0.0,
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
    "elementalAffinity" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "terrainAttackMod" REAL NOT NULL DEFAULT 1.0,
    "terrainDefenseMod" REAL NOT NULL DEFAULT 1.0,
    "innRecoveryRate" REAL NOT NULL DEFAULT 1.0,
    "resourceScarcity" REAL NOT NULL DEFAULT 1.0,
    "marketDemandIndex" REAL NOT NULL DEFAULT 1.0,
    "blessingType" TEXT,
    "sanctuaryPower" REAL NOT NULL DEFAULT 0.0,
    "corruptionLevel" REAL NOT NULL DEFAULT 0.0,
    "dominanCaste" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "regionTypeId" TEXT,
    "factionId" INTEGER,
    "guildOwnershipId" INTEGER,
    "gridX" INTEGER NOT NULL DEFAULT 0,
    "gridY" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RegionTemplate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "RegionArea" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_guildOwnershipId_fkey" FOREIGN KEY ("guildOwnershipId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("ambientSfxPack", "areaId", "blessingType", "corruptionLevel", "dangerLevel", "description", "discoveryXp", "dominanCaste", "elementalAffinity", "eliteSpawnChance", "factionId", "factionTributeRate", "flavorText", "gridX", "gridY", "guildOwnershipId", "hasInn", "id", "innRecoveryRate", "innTier", "isDiscoveryPoint", "isSafeZone", "landmarkName", "marketDemandIndex", "maxPartyUnits", "minRequiredHeroLevel", "minRequiredUnits", "minimapIcon", "name", "pvpMode", "regionCategory", "regionTypeId", "regionalTaxRate", "reputationRequirement", "requiredAchievementId", "requiredLevel", "resourceModifier", "resourceScarcity", "respawnPenaltyMult", "sanctuaryPower", "spawnRateMultiplier", "specialization", "teleportCostMultiplier", "terrainAttackMod", "terrainDefenseMod", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType") SELECT "ambientSfxPack", "areaId", "blessingType", "corruptionLevel", "dangerLevel", "description", "discoveryXp", "dominanCaste", "elementalAffinity", "eliteSpawnChance", "factionId", "factionTributeRate", "flavorText", "gridX", "gridY", "guildOwnershipId", "hasInn", "id", "innRecoveryRate", "innTier", "isDiscoveryPoint", "isSafeZone", "landmarkName", "marketDemandIndex", "maxPartyUnits", "minRequiredHeroLevel", "minRequiredUnits", "minimapIcon", "name", "pvpMode", "regionCategory", "regionTypeId", "regionalTaxRate", "reputationRequirement", "requiredAchievementId", "requiredLevel", "resourceModifier", "resourceScarcity", "respawnPenaltyMult", "sanctuaryPower", "spawnRateMultiplier", "specialization", "teleportCostMultiplier", "terrainAttackMod", "terrainDefenseMod", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isPvpFlagged" BOOLEAN NOT NULL DEFAULT false,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "vitality" INTEGER NOT NULL DEFAULT 100,
    "maxVitality" INTEGER NOT NULL DEFAULT 100,
    "lastVitalityUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxInventorySlots" INTEGER NOT NULL DEFAULT 20,
    "currentRegion" INTEGER NOT NULL DEFAULT 1,
    "tavernTimeSecondsToday" INTEGER NOT NULL DEFAULT 0,
    "lastTavernResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastQuestResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tavernEntryAt" DATETIME,
    "isInTavern" BOOLEAN NOT NULL DEFAULT false,
    "premiumTierId" INTEGER NOT NULL DEFAULT 0,
    "guildId" INTEGER,
    "guildRole" TEXT,
    "factionId" INTEGER,
    "pvpFlagged" BOOLEAN NOT NULL DEFAULT false,
    "lastPvpAction" DATETIME,
    "isKnockedOut" BOOLEAN NOT NULL DEFAULT false,
    "knockedOutUntil" DATETIME,
    "recoveryUntil" DATETIME,
    "lastVisitedCityId" INTEGER,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "moral" INTEGER NOT NULL DEFAULT 100,
    "bindPointId" INTEGER,
    "restingXpPool" INTEGER NOT NULL DEFAULT 0,
    "infamyScore" INTEGER NOT NULL DEFAULT 0,
    "informantReputation" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "User_currentRegion_fkey" FOREIGN KEY ("currentRegion") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_premiumTierId_fkey" FOREIGN KEY ("premiumTierId") REFERENCES "PremiumTierTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_bindPointId_fkey" FOREIGN KEY ("bindPointId") REFERENCES "RegionTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("bindPointId", "currentRegion", "factionId", "gold", "guildId", "guildRole", "id", "isInTavern", "isKnockedOut", "isPvpFlagged", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "moral", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "restingXpPool", "settings", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality") SELECT "bindPointId", "currentRegion", "factionId", "gold", "guildId", "guildRole", "id", "isInTavern", "isKnockedOut", "isPvpFlagged", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "moral", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "restingXpPool", "settings", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
