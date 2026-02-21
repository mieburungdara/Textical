/*
  Warnings:

  - You are about to drop the column `bonusSkillId` on the `EquipmentSetBonus` table. All the data in the column will be lost.
  - You are about to drop the column `maxVitalityBonus` on the `PremiumTierTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `vitalityRegenMult` on the `PremiumTierTemplate` table. All the data in the column will be lost.
  - You are about to alter the column `isUnlocked` on the `PrivateIsland` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to drop the column `lastVitalityUpdate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxVitality` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `vitality` on the `User` table. All the data in the column will be lost.
  - Added the required column `bonusValue` to the `EquipmentSetBonus` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SpiritTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lore" TEXT NOT NULL,
    "effectType" TEXT NOT NULL DEFAULT 'BUFF',
    "statKey" TEXT NOT NULL DEFAULT 'accuracy',
    "statValue" REAL NOT NULL DEFAULT 1.0,
    "isBenevolent" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "RegionSpirit" (
    "regionId" INTEGER NOT NULL,
    "spiritId" INTEGER NOT NULL,

    PRIMARY KEY ("regionId", "spiritId"),
    CONSTRAINT "RegionSpirit_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionSpirit_spiritId_fkey" FOREIGN KEY ("spiritId") REFERENCES "SpiritTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserAttribute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" REAL,
    "valBool" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserAttribute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterBehaviorParam" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" REAL,
    "valBool" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonsterBehaviorParam_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserQuestVariable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userQuestId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" REAL,
    "valBool" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserQuestVariable_userQuestId_fkey" FOREIGN KEY ("userQuestId") REFERENCES "UserQuest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildHistoryMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" REAL,
    "valBool" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GuildHistoryMeta_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "GuildHistory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildCreationRequirement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" REAL,
    "valBool" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GuildCreationRequirement_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentSetBonusStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bonusId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" REAL NOT NULL,
    CONSTRAINT "EquipmentSetBonusStat_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "EquipmentSetBonus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroStatCap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "allocationId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "capValue" INTEGER NOT NULL,
    CONSTRAINT "HeroStatCap_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "HeroStatAllocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroHistoryStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'PRIMARY',
    "statKey" TEXT NOT NULL,
    "statValue" REAL NOT NULL,
    "auditTrail" TEXT,
    CONSTRAINT "HeroHistoryStat_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroHistoryEquipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "slotKey" TEXT NOT NULL,
    "itemTemplateId" INTEGER,
    "itemInstanceId" INTEGER,
    CONSTRAINT "HeroHistoryEquipment_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroHistoryEquipment_itemTemplateId_fkey" FOREIGN KEY ("itemTemplateId") REFERENCES "ItemTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HeroHistoryEquipment_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroHistoryBuff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "traitTemplateId" INTEGER NOT NULL,
    CONSTRAINT "HeroHistoryBuff_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroHistoryBuff_traitTemplateId_fkey" FOREIGN KEY ("traitTemplateId") REFERENCES "TraitTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CropTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "seedItemId" INTEGER NOT NULL,
    "harvestItemId" INTEGER NOT NULL,
    "growthTimeSeconds" INTEGER NOT NULL DEFAULT 600,
    "minYield" INTEGER NOT NULL DEFAULT 1,
    "maxYield" INTEGER NOT NULL DEFAULT 3,
    "experienceReward" INTEGER NOT NULL DEFAULT 10,
    "season" TEXT NOT NULL DEFAULT 'ALL',
    "waterRequirement" INTEGER NOT NULL DEFAULT 1,
    "isPremium" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CropTemplate_seedItemId_fkey" FOREIGN KEY ("seedItemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CropTemplate_harvestItemId_fkey" FOREIGN KEY ("harvestItemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CropTemplate" ("description", "experienceReward", "growthTimeSeconds", "harvestItemId", "id", "isPremium", "maxYield", "minYield", "name", "season", "seedItemId", "waterRequirement") SELECT "description", "experienceReward", "growthTimeSeconds", "harvestItemId", "id", "isPremium", "maxYield", "minYield", "name", "season", "seedItemId", "waterRequirement" FROM "CropTemplate";
DROP TABLE "CropTemplate";
ALTER TABLE "new_CropTemplate" RENAME TO "CropTemplate";
CREATE INDEX "CropTemplate_seedItemId_idx" ON "CropTemplate"("seedItemId");
CREATE TABLE "new_EquipmentSetBonus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setId" INTEGER NOT NULL,
    "requiredPieces" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "bonusValue" INTEGER NOT NULL,
    "bonusStats" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "EquipmentSetBonus_setId_fkey" FOREIGN KEY ("setId") REFERENCES "EquipmentSetTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EquipmentSetBonus" ("bonusStats", "description", "id", "requiredPieces", "setId") SELECT "bonusStats", "description", "id", "requiredPieces", "setId" FROM "EquipmentSetBonus";
DROP TABLE "EquipmentSetBonus";
ALTER TABLE "new_EquipmentSetBonus" RENAME TO "EquipmentSetBonus";
CREATE UNIQUE INDEX "EquipmentSetBonus_setId_requiredPieces_key" ON "EquipmentSetBonus"("setId", "requiredPieces");
CREATE TABLE "new_Faction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#64748b'
);
INSERT INTO "new_Faction" ("description", "id", "name", "version") SELECT "description", "id", "name", "version" FROM "Faction";
DROP TABLE "Faction";
ALTER TABLE "new_Faction" RENAME TO "Faction";
CREATE TABLE "new_GardenPlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "islandId" INTEGER NOT NULL,
    "plotIndex" INTEGER NOT NULL,
    "cropTemplateId" INTEGER,
    "seedItemId" INTEGER,
    "plantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "harvestAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'EMPTY',
    "growthProgress" REAL NOT NULL DEFAULT 0.0,
    "yieldMultiplier" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "GardenPlot_islandId_fkey" FOREIGN KEY ("islandId") REFERENCES "PrivateIsland" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GardenPlot_cropTemplateId_fkey" FOREIGN KEY ("cropTemplateId") REFERENCES "ItemTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GardenPlot_seedItemId_fkey" FOREIGN KEY ("seedItemId") REFERENCES "ItemTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GardenPlot" ("cropTemplateId", "growthProgress", "harvestAt", "id", "islandId", "plantedAt", "plotIndex", "seedItemId", "status", "yieldMultiplier") SELECT "cropTemplateId", "growthProgress", "harvestAt", "id", "islandId", "plantedAt", "plotIndex", "seedItemId", "status", "yieldMultiplier" FROM "GardenPlot";
DROP TABLE "GardenPlot";
ALTER TABLE "new_GardenPlot" RENAME TO "GardenPlot";
CREATE INDEX "GardenPlot_islandId_idx" ON "GardenPlot"("islandId");
CREATE INDEX "GardenPlot_status_idx" ON "GardenPlot"("status");
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#f59e0b',
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    "treasury" INTEGER NOT NULL DEFAULT 0,
    "marketTaxRate" REAL NOT NULL DEFAULT 0.0,
    "gatheringTaxRate" REAL NOT NULL DEFAULT 0.0,
    "factionId" INTEGER,
    CONSTRAINT "Guild_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("factionId", "gatheringTaxRate", "id", "marketTaxRate", "name", "templateId", "treasury", "vaultGold") SELECT "factionId", "gatheringTaxRate", "id", "marketTaxRate", "name", "templateId", "treasury", "vaultGold" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
CREATE TABLE "new_IslandStorageItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "islandId" INTEGER NOT NULL,
    "itemTemplateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "slotIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IslandStorageItem_islandId_fkey" FOREIGN KEY ("islandId") REFERENCES "PrivateIsland" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IslandStorageItem_itemTemplateId_fkey" FOREIGN KEY ("itemTemplateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_IslandStorageItem" ("createdAt", "id", "islandId", "itemTemplateId", "quantity", "slotIndex") SELECT "createdAt", "id", "islandId", "itemTemplateId", "quantity", "slotIndex" FROM "IslandStorageItem";
DROP TABLE "IslandStorageItem";
ALTER TABLE "new_IslandStorageItem" RENAME TO "IslandStorageItem";
CREATE INDEX "IslandStorageItem_islandId_idx" ON "IslandStorageItem"("islandId");
CREATE INDEX "IslandStorageItem_slotIndex_idx" ON "IslandStorageItem"("slotIndex");
CREATE TABLE "new_PremiumTierTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "queueSlots" INTEGER NOT NULL DEFAULT 0,
    "speedBonus" REAL NOT NULL DEFAULT 0.0,
    "energyRegenMult" REAL NOT NULL DEFAULT 1.0,
    "maxEnergyBonus" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_PremiumTierTemplate" ("id", "name", "queueSlots", "speedBonus") SELECT "id", "name", "queueSlots", "speedBonus" FROM "PremiumTierTemplate";
DROP TABLE "PremiumTierTemplate";
ALTER TABLE "new_PremiumTierTemplate" RENAME TO "PremiumTierTemplate";
CREATE TABLE "new_PrivateIsland" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" DATETIME,
    "plotCount" INTEGER NOT NULL DEFAULT 10,
    "storageSlotCount" INTEGER NOT NULL DEFAULT 10,
    "maxPlots" INTEGER NOT NULL DEFAULT 50,
    "maxStorageSlots" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrivateIsland_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PrivateIsland" ("createdAt", "id", "isUnlocked", "maxPlots", "maxStorageSlots", "plotCount", "storageSlotCount", "unlockedAt", "updatedAt", "userId") SELECT "createdAt", "id", "isUnlocked", "maxPlots", "maxStorageSlots", "plotCount", "storageSlotCount", "unlockedAt", "updatedAt", "userId" FROM "PrivateIsland";
DROP TABLE "PrivateIsland";
ALTER TABLE "new_PrivateIsland" RENAME TO "PrivateIsland";
CREATE UNIQUE INDEX "PrivateIsland_userId_key" ON "PrivateIsland"("userId");
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
    "banditThreatLevel" REAL NOT NULL DEFAULT 0.0,
    "spiritDensity" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "RegionTemplate_guildOwnershipId_fkey" FOREIGN KEY ("guildOwnershipId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_mapMusicId_fkey" FOREIGN KEY ("mapMusicId") REFERENCES "AudioTrack" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "RegionArea" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("ambientSfxPack", "areaId", "banditThreatLevel", "blessingType", "corruptionLevel", "dangerLevel", "description", "discoveryXp", "dominanCaste", "ecologicalStress", "elementalAffinity", "eliteSpawnChance", "factionId", "factionTributeRate", "flavorText", "fogDensity", "gatheringStaminaCost", "gridX", "gridY", "guildBonusType", "guildOwnershipId", "hasInn", "id", "innRecoveryRate", "innTier", "isBanditHideout", "isDiscoveryPoint", "isSafeZone", "landmarkName", "manaStaticIntensity", "mapMusicId", "marketDemandIndex", "maxPartyUnits", "minRequiredHeroLevel", "minRequiredUnits", "minimapIcon", "monsterMigrationStatus", "mysticFogIntensity", "name", "particleEffectPack", "plotAvailability", "prestigePoints", "pvpMode", "rareHerbSpawnChance", "regionCategory", "regionLoreSnippet", "regionTypeId", "regionalTaxRate", "rentCostMultiplier", "reputationRequirement", "requiredAchievementId", "requiredLevel", "resourceModifier", "resourceScarcity", "respawnPenaltyMult", "sanctuaryPower", "skyboxOverride", "spawnRateMultiplier", "specialization", "teleportCostMultiplier", "terrainAttackMod", "terrainDefenseMod", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType") SELECT "ambientSfxPack", "areaId", "banditThreatLevel", "blessingType", "corruptionLevel", "dangerLevel", "description", "discoveryXp", "dominanCaste", "ecologicalStress", "elementalAffinity", "eliteSpawnChance", "factionId", "factionTributeRate", "flavorText", "fogDensity", "gatheringStaminaCost", "gridX", "gridY", "guildBonusType", "guildOwnershipId", "hasInn", "id", "innRecoveryRate", "innTier", "isBanditHideout", "isDiscoveryPoint", "isSafeZone", "landmarkName", "manaStaticIntensity", "mapMusicId", "marketDemandIndex", "maxPartyUnits", "minRequiredHeroLevel", "minRequiredUnits", "minimapIcon", "monsterMigrationStatus", "mysticFogIntensity", "name", "particleEffectPack", "plotAvailability", "prestigePoints", "pvpMode", "rareHerbSpawnChance", "regionCategory", "regionLoreSnippet", "regionTypeId", "regionalTaxRate", "rentCostMultiplier", "reputationRequirement", "requiredAchievementId", "requiredLevel", "resourceModifier", "resourceScarcity", "respawnPenaltyMult", "sanctuaryPower", "skyboxOverride", "spawnRateMultiplier", "specialization", "teleportCostMultiplier", "terrainAttackMod", "terrainDefenseMod", "traversalType", "version", "visualType", "weatherOverride", "zoneColor", "zoneLevel", "zoneType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isPvpFlagged" BOOLEAN NOT NULL DEFAULT false,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "maxEnergy" INTEGER NOT NULL DEFAULT 100,
    "lastEnergyUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "moral" INTEGER NOT NULL DEFAULT 0,
    "bindPointId" INTEGER,
    "restingXpPool" INTEGER NOT NULL DEFAULT 0,
    "infamyScore" INTEGER NOT NULL DEFAULT 0,
    "informantReputation" REAL NOT NULL DEFAULT 0.0,
    "banditReputation" REAL NOT NULL DEFAULT 0.0,
    "escortGridsRemaining" INTEGER NOT NULL DEFAULT 0,
    "activeEscortName" TEXT,
    "activeSpiritId" INTEGER,
    "activeSpiritExpiresAt" DATETIME,
    CONSTRAINT "User_bindPointId_fkey" FOREIGN KEY ("bindPointId") REFERENCES "RegionTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_premiumTierId_fkey" FOREIGN KEY ("premiumTierId") REFERENCES "PremiumTierTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_currentRegion_fkey" FOREIGN KEY ("currentRegion") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_activeSpiritId_fkey" FOREIGN KEY ("activeSpiritId") REFERENCES "SpiritTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("activeEscortName", "banditReputation", "bindPointId", "currentRegion", "escortGridsRemaining", "factionId", "gold", "guildId", "guildRole", "id", "infamyScore", "informantReputation", "isInTavern", "isKnockedOut", "isPvpFlagged", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "maxInventorySlots", "moral", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "restingXpPool", "settings", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username") SELECT "activeEscortName", "banditReputation", "bindPointId", "currentRegion", "escortGridsRemaining", "factionId", "gold", "guildId", "guildRole", "id", "infamyScore", "informantReputation", "isInTavern", "isKnockedOut", "isPvpFlagged", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "maxInventorySlots", "moral", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "restingXpPool", "settings", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserAttribute_userId_key_key" ON "UserAttribute"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterBehaviorParam_monsterId_key_key" ON "MonsterBehaviorParam"("monsterId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestVariable_userQuestId_key_key" ON "UserQuestVariable"("userQuestId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "GuildHistoryMeta_historyId_key_key" ON "GuildHistoryMeta"("historyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "GuildCreationRequirement_templateId_key_key" ON "GuildCreationRequirement"("templateId", "key");
