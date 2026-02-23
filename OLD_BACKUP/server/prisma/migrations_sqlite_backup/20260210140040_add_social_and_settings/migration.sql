/*
  Warnings:

  - You are about to drop the column `regionId` on the `Siege` table. All the data in the column will be lost.
  - You are about to drop the column `dangerLevel` on the `RegionTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[originRegionId,targetRegionId]` on the table `RegionConnection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endsAt` to the `Siege` table without a default value. This is not possible if the table is not empty.
  - Added the required column `territoryId` to the `Siege` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "UserFriend" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AchievementTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🏆',
    "category" TEXT NOT NULL DEFAULT 'GENERAL'
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildInvite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" INTEGER NOT NULL,
    "invitedUserId" INTEGER,
    "invitedBy" INTEGER NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuildInvite_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GuildInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GuildInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" INTEGER,
    "targetUserId" INTEGER,
    "description" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuildHistory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GuildHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GuildHistory_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "currentHour" INTEGER NOT NULL DEFAULT 12,
    "weatherType" TEXT NOT NULL DEFAULT 'CLEAR',
    "lastTick" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelType" TEXT NOT NULL DEFAULT 'GLOBAL',
    "channelId" INTEGER,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroElementalAffinity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "elementType" TEXT NOT NULL,
    "resistance" REAL NOT NULL DEFAULT 0,
    "bonusDamage" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "HeroElementalAffinity_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentSetTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EquipmentSetPiece" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setId" INTEGER NOT NULL,
    "pieceOrder" INTEGER NOT NULL,
    "itemTemplateId" INTEGER NOT NULL,
    CONSTRAINT "EquipmentSetPiece_setId_fkey" FOREIGN KEY ("setId") REFERENCES "EquipmentSetTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentSetBonus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setId" INTEGER NOT NULL,
    "requiredPieces" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "bonusStats" TEXT NOT NULL DEFAULT '{}',
    "bonusSkillId" INTEGER,
    CONSTRAINT "EquipmentSetBonus_setId_fkey" FOREIGN KEY ("setId") REFERENCES "EquipmentSetTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SetBonusCondition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bonusId" INTEGER NOT NULL,
    "conditionType" TEXT NOT NULL,
    "conditionValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HeroEquipmentSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "setId" INTEGER NOT NULL,
    "equippedPieces" INTEGER NOT NULL DEFAULT 0,
    "activeBonusId" INTEGER,
    CONSTRAINT "HeroEquipmentSet_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatAllocationTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classId" INTEGER NOT NULL,
    "strGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "dexGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "intGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "vitGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "lukGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "strGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "dexGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "intGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "vitGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "lukGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "basePointsPerLevel" INTEGER NOT NULL DEFAULT 5,
    "maxStatCap" INTEGER NOT NULL DEFAULT 255,
    "recommendedStr" INTEGER NOT NULL DEFAULT 10,
    "recommendedDex" INTEGER NOT NULL DEFAULT 10,
    "recommendedInt" INTEGER NOT NULL DEFAULT 10,
    "recommendedVit" INTEGER NOT NULL DEFAULT 10,
    "recommendedLuk" INTEGER NOT NULL DEFAULT 5
);

-- CreateTable
CREATE TABLE "HeroStatAllocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "availablePoints" INTEGER NOT NULL DEFAULT 0,
    "strAllocated" INTEGER NOT NULL DEFAULT 0,
    "dexAllocated" INTEGER NOT NULL DEFAULT 0,
    "intAllocated" INTEGER NOT NULL DEFAULT 0,
    "vitAllocated" INTEGER NOT NULL DEFAULT 0,
    "lukAllocated" INTEGER NOT NULL DEFAULT 0,
    "statCaps" TEXT NOT NULL DEFAULT '{}',
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" DATETIME,
    CONSTRAINT "HeroStatAllocation_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroStatHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "primaryStats" TEXT NOT NULL DEFAULT '{}',
    "secondaryStats" TEXT NOT NULL DEFAULT '{}',
    "level" INTEGER NOT NULL,
    "equippedItems" TEXT NOT NULL DEFAULT '[]',
    "activeBuffs" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "HeroStatHistory_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "creationReqs" TEXT NOT NULL DEFAULT '{}',
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "baseTreasury" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_GuildTemplate" ("id", "name") SELECT "id", "name" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
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
    CONSTRAINT "User_currentRegion_fkey" FOREIGN KEY ("currentRegion") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_premiumTierId_fkey" FOREIGN KEY ("premiumTierId") REFERENCES "PremiumTierTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("currentRegion", "factionId", "gold", "guildId", "id", "isInTavern", "isKnockedOut", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality") SELECT "currentRegion", "factionId", "gold", "guildId", "id", "isInTavern", "isKnockedOut", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_ItemSaleHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER,
    "templateId" INTEGER NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "soldAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ItemSaleHistory_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ItemSaleHistory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemSaleHistory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ItemSaleHistory" ("id", "pricePerUnit", "quantity", "regionId", "soldAt", "templateId") SELECT "id", "pricePerUnit", "quantity", "regionId", "soldAt", "templateId" FROM "ItemSaleHistory";
DROP TABLE "ItemSaleHistory";
ALTER TABLE "new_ItemSaleHistory" RENAME TO "ItemSaleHistory";
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "name" TEXT NOT NULL,
    "unitLevel" INTEGER NOT NULL DEFAULT 1,
    "unitXp" INTEGER NOT NULL DEFAULT 0,
    "classLevel" INTEGER NOT NULL DEFAULT 1,
    "classXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "hp_base" INTEGER NOT NULL DEFAULT 100,
    "damage_base" INTEGER NOT NULL DEFAULT 10,
    "str" INTEGER NOT NULL DEFAULT 10,
    "dex" INTEGER NOT NULL DEFAULT 10,
    "int" INTEGER NOT NULL DEFAULT 10,
    "vit" INTEGER NOT NULL DEFAULT 10,
    "luk" INTEGER NOT NULL DEFAULT 5,
    "fire_damage" INTEGER NOT NULL DEFAULT 0,
    "water_damage" INTEGER NOT NULL DEFAULT 0,
    "earth_damage" INTEGER NOT NULL DEFAULT 0,
    "wind_damage" INTEGER NOT NULL DEFAULT 0,
    "light_damage" INTEGER NOT NULL DEFAULT 0,
    "dark_damage" INTEGER NOT NULL DEFAULT 0,
    "defense_base" INTEGER NOT NULL DEFAULT 0,
    "speed_base" INTEGER NOT NULL DEFAULT 5,
    "range_base" INTEGER NOT NULL DEFAULT 1,
    "dodge_chance" REAL NOT NULL DEFAULT 0.05,
    "crit_chance" REAL NOT NULL DEFAULT 0.05,
    "crit_damage" REAL NOT NULL DEFAULT 1.5,
    "block_chance" REAL NOT NULL DEFAULT 0,
    "parry_chance" REAL NOT NULL DEFAULT 0,
    "hp_regen" REAL NOT NULL DEFAULT 0,
    "mana_regen" REAL NOT NULL DEFAULT 2,
    "accuracy_base" INTEGER NOT NULL DEFAULT 100,
    "armor_penetration" INTEGER NOT NULL DEFAULT 0,
    "skill_power_base" INTEGER NOT NULL DEFAULT 10,
    "tenacity_base" REAL NOT NULL DEFAULT 0,
    "block_power_base" REAL NOT NULL DEFAULT 0.5,
    "initiative_base" INTEGER NOT NULL DEFAULT 0,
    "lifesteal_base" REAL NOT NULL DEFAULT 0,
    "spell_vamp" REAL NOT NULL DEFAULT 0,
    "cooldown_reduction" REAL NOT NULL DEFAULT 0,
    "move_speed" REAL NOT NULL DEFAULT 100,
    "attack_speed" REAL NOT NULL DEFAULT 1.0,
    "classId" INTEGER NOT NULL,
    "jobId" INTEGER,
    "vitality" INTEGER NOT NULL DEFAULT 100,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "hasOffspring" BOOLEAN NOT NULL DEFAULT false,
    "fatherId" INTEGER,
    "motherId" INTEGER,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Hero" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Hero" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "classLevel", "classXp", "damage_base", "dex", "fatherId", "generation", "hasOffspring", "hp_base", "id", "int", "isMain", "jobId", "level", "motherId", "name", "str", "unitLevel", "unitXp", "userId", "vit", "vitality", "xp") SELECT "classId", "classLevel", "classXp", "damage_base", "dex", "fatherId", "generation", "hasOffspring", "hp_base", "id", "int", "isMain", "jobId", "level", "motherId", "name", "str", "unitLevel", "unitXp", "userId", "vit", "vitality", "xp" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_Siege" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "territoryId" INTEGER NOT NULL,
    "attackerGuildId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME NOT NULL,
    CONSTRAINT "Siege_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Siege_attackerGuildId_fkey" FOREIGN KEY ("attackerGuildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Siege" ("attackerGuildId", "id", "status") SELECT "attackerGuildId", "id", "status" FROM "Siege";
DROP TABLE "Siege";
ALTER TABLE "new_Siege" RENAME TO "Siege";
CREATE TABLE "new_SiegeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siegeId" INTEGER NOT NULL,
    "event" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiegeLog_siegeId_fkey" FOREIGN KEY ("siegeId") REFERENCES "Siege" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SiegeLog" ("event", "id", "siegeId") SELECT "event", "id", "siegeId" FROM "SiegeLog";
DROP TABLE "SiegeLog";
ALTER TABLE "new_SiegeLog" RENAME TO "SiegeLog";
CREATE TABLE "new_Territory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "guildId" INTEGER NOT NULL,
    "fortification" INTEGER NOT NULL DEFAULT 1000,
    "maxFortification" INTEGER NOT NULL DEFAULT 1000,
    "siegeStatus" TEXT NOT NULL DEFAULT 'PEACE',
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpkeepAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Territory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Territory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Territory" ("capturedAt", "guildId", "id", "lastUpkeepAt", "regionId") SELECT "capturedAt", "guildId", "id", "lastUpkeepAt", "regionId" FROM "Territory";
DROP TABLE "Territory";
ALTER TABLE "new_Territory" RENAME TO "Territory";
CREATE UNIQUE INDEX "Territory_regionId_key" ON "Territory"("regionId");
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visualType" TEXT NOT NULL DEFAULT 'TOWN',
    "zoneType" TEXT NOT NULL DEFAULT 'GREEN',
    "zoneLevel" INTEGER NOT NULL DEFAULT 1,
    "regionalTaxRate" REAL NOT NULL DEFAULT 0.10,
    "weatherOverride" TEXT,
    "specialization" TEXT,
    "regionTypeId" TEXT,
    "factionId" INTEGER,
    CONSTRAINT "RegionTemplate_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("description", "factionId", "id", "name", "regionalTaxRate", "visualType", "zoneType") SELECT "description", "factionId", "id", "name", "regionalTaxRate", "visualType", "zoneType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "UserFriend_userId_friendId_key" ON "UserFriend"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildInvite_inviteCode_key" ON "GuildInvite"("inviteCode");

-- CreateIndex
CREATE INDEX "GuildInvite_guildId_idx" ON "GuildInvite"("guildId");

-- CreateIndex
CREATE INDEX "GuildInvite_inviteCode_idx" ON "GuildInvite"("inviteCode");

-- CreateIndex
CREATE INDEX "GuildHistory_guildId_idx" ON "GuildHistory"("guildId");

-- CreateIndex
CREATE INDEX "GuildHistory_createdAt_idx" ON "GuildHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HeroElementalAffinity_heroId_elementType_key" ON "HeroElementalAffinity"("heroId", "elementType");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSetTemplate_name_key" ON "EquipmentSetTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSetPiece_setId_pieceOrder_key" ON "EquipmentSetPiece"("setId", "pieceOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSetBonus_setId_requiredPieces_key" ON "EquipmentSetBonus"("setId", "requiredPieces");

-- CreateIndex
CREATE UNIQUE INDEX "HeroEquipmentSet_heroId_setId_key" ON "HeroEquipmentSet"("heroId", "setId");

-- CreateIndex
CREATE UNIQUE INDEX "StatAllocationTemplate_classId_key" ON "StatAllocationTemplate"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroStatAllocation_heroId_key" ON "HeroStatAllocation"("heroId");

-- CreateIndex
CREATE INDEX "HeroStatHistory_heroId_recordedAt_idx" ON "HeroStatHistory"("heroId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegionConnection_originRegionId_targetRegionId_key" ON "RegionConnection"("originRegionId", "targetRegionId");
