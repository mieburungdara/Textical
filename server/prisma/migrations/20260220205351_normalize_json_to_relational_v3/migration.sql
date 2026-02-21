/*
  Warnings:

  - You are about to drop the column `playerIds` on the `ArenaMatch` table. All the data in the column will be lost.
  - You are about to drop the column `ratingChanges` on the `ArenaMatch` table. All the data in the column will be lost.
  - You are about to drop the column `scores` on the `ArenaMatch` table. All the data in the column will be lost.
  - You are about to drop the column `teamAIds` on the `ArenaMatch` table. All the data in the column will be lost.
  - You are about to drop the column `teamBIds` on the `ArenaMatch` table. All the data in the column will be lost.
  - You are about to drop the column `topRewards` on the `ArenaSeason` table. All the data in the column will be lost.
  - You are about to drop the column `floorProgress` on the `DungeonEntry` table. All the data in the column will be lost.
  - You are about to drop the column `rewardsClaimed` on the `DungeonEntry` table. All the data in the column will be lost.
  - You are about to drop the column `monsterPoolIds` on the `DungeonFloor` table. All the data in the column will be lost.
  - You are about to drop the column `statMultipliers` on the `DungeonModifier` table. All the data in the column will be lost.
  - You are about to drop the column `statusEffects` on the `DungeonModifier` table. All the data in the column will be lost.
  - You are about to drop the column `bonusStats` on the `EquipmentSetBonus` table. All the data in the column will be lost.
  - You are about to drop the column `statKey` on the `EquipmentSetBonusStat` table. All the data in the column will be lost.
  - You are about to drop the column `statValue` on the `EquipmentSetBonusStat` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `GuildHistory` table. All the data in the column will be lost.
  - You are about to drop the column `creationReqs` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `activeBuffs` on the `HeroStatHistory` table. All the data in the column will be lost.
  - You are about to drop the column `equippedItems` on the `HeroStatHistory` table. All the data in the column will be lost.
  - You are about to drop the column `primaryStats` on the `HeroStatHistory` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryStats` on the `HeroStatHistory` table. All the data in the column will be lost.
  - You are about to drop the column `aiConfig` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `unlockedTiers` on the `PlayerAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `prizePool` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `progressData` on the `UserQuest` table. All the data in the column will be lost.
  - Added the required column `key` to the `EquipmentSetBonusStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `EquipmentSetBonusStat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "UserSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterAiConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "MonsterAiConfig_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserQuestProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userQuestId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "UserQuestProgress_userQuestId_fkey" FOREIGN KEY ("userQuestId") REFERENCES "UserQuest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildHistoryMetadata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "GuildHistoryMetadata_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "GuildHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildCreationReqData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "GuildCreationReqData_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroHistoryPrimaryStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "HeroHistoryPrimaryStat_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroHistorySecondaryStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "HeroHistorySecondaryStat_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroHistoryEquippedItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    CONSTRAINT "HeroHistoryEquippedItem_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroHistoryActiveBuff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "historyId" INTEGER NOT NULL,
    "buffId" TEXT NOT NULL,
    CONSTRAINT "HeroHistoryActiveBuff_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DungeonModifierStatMult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modifierId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "DungeonModifierStatMult_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "DungeonModifier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DungeonModifierStatusEffect" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modifierId" INTEGER NOT NULL,
    "effectId" TEXT NOT NULL,
    CONSTRAINT "DungeonModifierStatusEffect_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "DungeonModifier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DungeonFloorMonsterPool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "floorId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,
    CONSTRAINT "DungeonFloorMonsterPool_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "DungeonFloor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DungeonEntryFloorProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entryId" INTEGER NOT NULL,
    "floorId" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "bossesKilled" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DungeonEntryFloorProgress_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DungeonEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DungeonEntryRewardClaim" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entryId" INTEGER NOT NULL,
    "rewardId" TEXT NOT NULL,
    CONSTRAINT "DungeonEntryRewardClaim_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DungeonEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArenaMatchParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "ratingBefore" INTEGER,
    "ratingAfter" INTEGER,
    "ratingDelta" INTEGER,
    CONSTRAINT "ArenaMatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "ArenaMatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArenaSeasonTopReward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "seasonId" TEXT NOT NULL,
    "rankValue" INTEGER NOT NULL,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    CONSTRAINT "ArenaSeasonTopReward_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "ArenaSeason" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TournamentPrize" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tournamentId" TEXT NOT NULL,
    "rankValue" INTEGER NOT NULL,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    CONSTRAINT "TournamentPrize_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerAchievementTier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerAchievId" TEXT NOT NULL,
    "tierValue" INTEGER NOT NULL,
    CONSTRAINT "PlayerAchievementTier_playerAchievId_fkey" FOREIGN KEY ("playerAchievId") REFERENCES "PlayerAchievement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArenaMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchCode" TEXT NOT NULL,
    "gameMode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "winnerId" TEXT,
    "winCondition" TEXT,
    "queuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "duration" INTEGER,
    "seasonId" TEXT,
    "isRanked" BOOLEAN NOT NULL DEFAULT true,
    "battleId" TEXT
);
INSERT INTO "new_ArenaMatch" ("battleId", "duration", "endedAt", "gameMode", "id", "isRanked", "matchCode", "queuedAt", "seasonId", "startedAt", "status", "winCondition", "winnerId") SELECT "battleId", "duration", "endedAt", "gameMode", "id", "isRanked", "matchCode", "queuedAt", "seasonId", "startedAt", "status", "winCondition", "winnerId" FROM "ArenaMatch";
DROP TABLE "ArenaMatch";
ALTER TABLE "new_ArenaMatch" RENAME TO "ArenaMatch";
CREATE UNIQUE INDEX "ArenaMatch_matchCode_key" ON "ArenaMatch"("matchCode");
CREATE INDEX "ArenaMatch_seasonId_gameMode_idx" ON "ArenaMatch"("seasonId", "gameMode");
CREATE INDEX "ArenaMatch_status_idx" ON "ArenaMatch"("status");
CREATE INDEX "ArenaMatch_winnerId_idx" ON "ArenaMatch"("winnerId");
CREATE TABLE "new_ArenaSeason" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "participation" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ArenaSeason" ("createdAt", "endDate", "id", "isActive", "isComplete", "name", "participation", "seasonNumber", "startDate") SELECT "createdAt", "endDate", "id", "isActive", "isComplete", "name", "participation", "seasonNumber", "startDate" FROM "ArenaSeason";
DROP TABLE "ArenaSeason";
ALTER TABLE "new_ArenaSeason" RENAME TO "ArenaSeason";
CREATE UNIQUE INDEX "ArenaSeason_seasonNumber_key" ON "ArenaSeason"("seasonNumber");
CREATE TABLE "new_DungeonEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "dungeonId" INTEGER NOT NULL,
    "currentFloor" INTEGER NOT NULL DEFAULT 1,
    "highestFloor" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "firstEnteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEnteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "lastResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalGoldEarned" INTEGER NOT NULL DEFAULT 0,
    "totalXpEarned" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DungeonEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DungeonEntry_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "DungeonTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DungeonEntry" ("attempts", "completedAt", "completions", "currentFloor", "dungeonId", "firstEnteredAt", "highestFloor", "id", "lastEnteredAt", "lastResetAt", "totalGoldEarned", "totalXpEarned", "userId") SELECT "attempts", "completedAt", "completions", "currentFloor", "dungeonId", "firstEnteredAt", "highestFloor", "id", "lastEnteredAt", "lastResetAt", "totalGoldEarned", "totalXpEarned", "userId" FROM "DungeonEntry";
DROP TABLE "DungeonEntry";
ALTER TABLE "new_DungeonEntry" RENAME TO "DungeonEntry";
CREATE INDEX "DungeonEntry_userId_idx" ON "DungeonEntry"("userId");
CREATE UNIQUE INDEX "DungeonEntry_userId_dungeonId_key" ON "DungeonEntry"("userId", "dungeonId");
CREATE TABLE "new_DungeonFloor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dungeonId" INTEGER NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gridWidth" INTEGER NOT NULL DEFAULT 8,
    "gridHeight" INTEGER NOT NULL DEFAULT 8,
    "tileMapPath" TEXT,
    "eliteSpawnRate" REAL NOT NULL DEFAULT 0.1,
    "bossSpawnRate" REAL NOT NULL DEFAULT 0.0,
    "monsterLevelScale" REAL NOT NULL DEFAULT 1.0,
    "goldRewardScale" REAL NOT NULL DEFAULT 1.0,
    "xpRewardScale" REAL NOT NULL DEFAULT 1.0,
    "lootBonusScale" REAL NOT NULL DEFAULT 1.0,
    "killCountRequired" INTEGER NOT NULL DEFAULT 10,
    "bossRequired" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DungeonFloor_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "DungeonTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DungeonFloor" ("bossRequired", "bossSpawnRate", "description", "dungeonId", "eliteSpawnRate", "floorNumber", "goldRewardScale", "gridHeight", "gridWidth", "id", "killCountRequired", "lootBonusScale", "monsterLevelScale", "name", "tileMapPath", "xpRewardScale") SELECT "bossRequired", "bossSpawnRate", "description", "dungeonId", "eliteSpawnRate", "floorNumber", "goldRewardScale", "gridHeight", "gridWidth", "id", "killCountRequired", "lootBonusScale", "monsterLevelScale", "name", "tileMapPath", "xpRewardScale" FROM "DungeonFloor";
DROP TABLE "DungeonFloor";
ALTER TABLE "new_DungeonFloor" RENAME TO "DungeonFloor";
CREATE UNIQUE INDEX "DungeonFloor_dungeonId_floorNumber_key" ON "DungeonFloor"("dungeonId", "floorNumber");
CREATE TABLE "new_DungeonModifier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modifierKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '⚡',
    "color" TEXT NOT NULL DEFAULT '#ff0000'
);
INSERT INTO "new_DungeonModifier" ("category", "color", "description", "icon", "id", "modifierKey", "name") SELECT "category", "color", "description", "icon", "id", "modifierKey", "name" FROM "DungeonModifier";
DROP TABLE "DungeonModifier";
ALTER TABLE "new_DungeonModifier" RENAME TO "DungeonModifier";
CREATE UNIQUE INDEX "DungeonModifier_modifierKey_key" ON "DungeonModifier"("modifierKey");
CREATE TABLE "new_EquipmentSetBonus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setId" INTEGER NOT NULL,
    "requiredPieces" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "bonusValue" INTEGER NOT NULL,
    CONSTRAINT "EquipmentSetBonus_setId_fkey" FOREIGN KEY ("setId") REFERENCES "EquipmentSetTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EquipmentSetBonus" ("bonusValue", "description", "id", "requiredPieces", "setId") SELECT "bonusValue", "description", "id", "requiredPieces", "setId" FROM "EquipmentSetBonus";
DROP TABLE "EquipmentSetBonus";
ALTER TABLE "new_EquipmentSetBonus" RENAME TO "EquipmentSetBonus";
CREATE UNIQUE INDEX "EquipmentSetBonus_setId_requiredPieces_key" ON "EquipmentSetBonus"("setId", "requiredPieces");
CREATE TABLE "new_EquipmentSetBonusStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bonusId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "EquipmentSetBonusStat_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "EquipmentSetBonus" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EquipmentSetBonusStat" ("bonusId", "id") SELECT "bonusId", "id" FROM "EquipmentSetBonusStat";
DROP TABLE "EquipmentSetBonusStat";
ALTER TABLE "new_EquipmentSetBonusStat" RENAME TO "EquipmentSetBonusStat";
CREATE UNIQUE INDEX "EquipmentSetBonusStat_bonusId_key_key" ON "EquipmentSetBonusStat"("bonusId", "key");
CREATE TABLE "new_GuildHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" INTEGER,
    "targetUserId" INTEGER,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuildHistory_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GuildHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GuildHistory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GuildHistory" ("createdAt", "description", "eventType", "guildId", "id", "targetUserId", "userId") SELECT "createdAt", "description", "eventType", "guildId", "id", "targetUserId", "userId" FROM "GuildHistory";
DROP TABLE "GuildHistory";
ALTER TABLE "new_GuildHistory" RENAME TO "GuildHistory";
CREATE INDEX "GuildHistory_guildId_idx" ON "GuildHistory"("guildId");
CREATE INDEX "GuildHistory_createdAt_idx" ON "GuildHistory"("createdAt");
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "baseTreasury" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_GuildTemplate" ("baseTreasury", "description", "id", "maxMembers", "name") SELECT "baseTreasury", "description", "id", "maxMembers", "name" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_HeroStatHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" INTEGER NOT NULL,
    CONSTRAINT "HeroStatHistory_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroStatHistory" ("heroId", "id", "level", "recordedAt") SELECT "heroId", "id", "level", "recordedAt" FROM "HeroStatHistory";
DROP TABLE "HeroStatHistory";
ALTER TABLE "new_HeroStatHistory" RENAME TO "HeroStatHistory";
CREATE INDEX "HeroStatHistory_heroId_recordedAt_idx" ON "HeroStatHistory"("heroId", "recordedAt");
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "shortDesc" TEXT NOT NULL DEFAULT '',
    "iconPath" TEXT NOT NULL DEFAULT '',
    "modelPath" TEXT NOT NULL DEFAULT '',
    "modelScale" REAL NOT NULL DEFAULT 1.0,
    "race" TEXT NOT NULL DEFAULT 'BEAST',
    "rank" TEXT NOT NULL DEFAULT 'COMMON',
    "size" TEXT NOT NULL DEFAULT 'MEDIUM',
    "gridSize" INTEGER NOT NULL DEFAULT 1,
    "movementType" TEXT NOT NULL DEFAULT 'WALK',
    "sfx_attack" TEXT,
    "sfx_hit" TEXT,
    "sfx_die" TEXT,
    "dialoguePack" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "hp_growth" REAL NOT NULL DEFAULT 0,
    "damage_growth" REAL NOT NULL DEFAULT 0,
    "defense_growth" REAL NOT NULL DEFAULT 0,
    "aiScript" TEXT NOT NULL DEFAULT 'SimpleAI',
    "attack_element" TEXT NOT NULL DEFAULT 'PHYSICAL',
    "threat_modifier" REAL NOT NULL DEFAULT 1.0,
    "preferred_target" TEXT NOT NULL DEFAULT 'RANDOM',
    "preferred_weather" TEXT,
    "active_time" TEXT,
    "defense_base" INTEGER NOT NULL DEFAULT 0,
    "speed_base" INTEGER NOT NULL DEFAULT 5,
    "range_base" INTEGER NOT NULL DEFAULT 1,
    "accuracy_base" INTEGER NOT NULL DEFAULT 100,
    "dodge_rate" REAL NOT NULL DEFAULT 0.05,
    "crit_chance" REAL NOT NULL DEFAULT 0.05,
    "crit_damage" REAL NOT NULL DEFAULT 1.5,
    "block_chance" REAL NOT NULL DEFAULT 0,
    "block_power_base" REAL NOT NULL DEFAULT 0.5,
    "initiative_base" INTEGER NOT NULL DEFAULT 0,
    "lifesteal_base" REAL NOT NULL DEFAULT 0,
    "cooldown_reduction" REAL NOT NULL DEFAULT 0,
    "move_speed" REAL NOT NULL DEFAULT 100,
    "attack_speed" REAL NOT NULL DEFAULT 1.0,
    "res_fire" REAL NOT NULL DEFAULT 1.0,
    "res_water" REAL NOT NULL DEFAULT 1.0,
    "res_earth" REAL NOT NULL DEFAULT 1.0,
    "res_wind" REAL NOT NULL DEFAULT 1.0,
    "res_light" REAL NOT NULL DEFAULT 1.0,
    "res_dark" REAL NOT NULL DEFAULT 1.0,
    "behaviorTree" TEXT NOT NULL DEFAULT 'SimpleAI',
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("accuracy_base", "active_time", "aiScript", "attack_element", "attack_speed", "behaviorTree", "block_chance", "block_power_base", "categoryId", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "damage_growth", "defense_base", "defense_growth", "description", "dialoguePack", "dodge_rate", "goldReward", "gridSize", "hp_base", "hp_growth", "iconPath", "id", "initiative_base", "level", "lifesteal_base", "modelPath", "modelScale", "move_speed", "movementType", "name", "preferred_target", "preferred_weather", "race", "range_base", "rank", "res_dark", "res_earth", "res_fire", "res_light", "res_water", "res_wind", "sfx_attack", "sfx_die", "sfx_hit", "shortDesc", "size", "speed_base", "threat_modifier", "version", "xpReward") SELECT "accuracy_base", "active_time", "aiScript", "attack_element", "attack_speed", "behaviorTree", "block_chance", "block_power_base", "categoryId", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "damage_growth", "defense_base", "defense_growth", "description", "dialoguePack", "dodge_rate", "goldReward", "gridSize", "hp_base", "hp_growth", "iconPath", "id", "initiative_base", "level", "lifesteal_base", "modelPath", "modelScale", "move_speed", "movementType", "name", "preferred_target", "preferred_weather", "race", "range_base", "rank", "res_dark", "res_earth", "res_fire", "res_light", "res_water", "res_wind", "sfx_attack", "sfx_die", "sfx_hit", "shortDesc", "size", "speed_base", "threat_modifier", "version", "xpReward" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_PlayerAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "achievementCode" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "currentTier" INTEGER NOT NULL DEFAULT 0,
    "rewardsClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" DATETIME,
    "isDiscovered" BOOLEAN NOT NULL DEFAULT false,
    "discoveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerAchievement_achievementCode_fkey" FOREIGN KEY ("achievementCode") REFERENCES "Achievement" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlayerAchievement" ("achievementCode", "claimedAt", "completedAt", "createdAt", "currentTier", "currentValue", "discoveredAt", "id", "isCompleted", "isDiscovered", "rewardsClaimed", "updatedAt", "userId") SELECT "achievementCode", "claimedAt", "completedAt", "createdAt", "currentTier", "currentValue", "discoveredAt", "id", "isCompleted", "isDiscovered", "rewardsClaimed", "updatedAt", "userId" FROM "PlayerAchievement";
DROP TABLE "PlayerAchievement";
ALTER TABLE "new_PlayerAchievement" RENAME TO "PlayerAchievement";
CREATE INDEX "PlayerAchievement_userId_idx" ON "PlayerAchievement"("userId");
CREATE UNIQUE INDEX "PlayerAchievement_userId_achievementCode_key" ON "PlayerAchievement"("userId", "achievementCode");
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "bracketType" TEXT NOT NULL,
    "registrationStart" DATETIME NOT NULL,
    "registrationEnd" DATETIME NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "entryFee" INTEGER NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 50,
    "participationReward" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REGISTRATION',
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Tournament" ("bracketType", "createdAt", "currentParticipants", "endDate", "entryFee", "id", "maxParticipants", "minLevel", "name", "participationReward", "registrationEnd", "registrationStart", "startDate", "status", "type", "winnerId") SELECT "bracketType", "createdAt", "currentParticipants", "endDate", "entryFee", "id", "maxParticipants", "minLevel", "name", "participationReward", "registrationEnd", "registrationStart", "startDate", "status", "type", "winnerId" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
CREATE INDEX "Tournament_status_startDate_idx" ON "Tournament"("status", "startDate");
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
INSERT INTO "new_User" ("activeEscortName", "activeSpiritExpiresAt", "activeSpiritId", "banditReputation", "bindPointId", "currentRegion", "energy", "escortGridsRemaining", "factionId", "gold", "guildId", "guildRole", "id", "infamyScore", "informantReputation", "isInTavern", "isKnockedOut", "isPvpFlagged", "knockedOutUntil", "lastEnergyUpdate", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "maxEnergy", "maxInventorySlots", "moral", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "restingXpPool", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username") SELECT "activeEscortName", "activeSpiritExpiresAt", "activeSpiritId", "banditReputation", "bindPointId", "currentRegion", "energy", "escortGridsRemaining", "factionId", "gold", "guildId", "guildRole", "id", "infamyScore", "informantReputation", "isInTavern", "isKnockedOut", "isPvpFlagged", "knockedOutUntil", "lastEnergyUpdate", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "maxEnergy", "maxInventorySlots", "moral", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "restingXpPool", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_UserQuest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "currentStageId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "UserQuest_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "QuestStage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserQuest" ("currentStageId", "id", "questId", "status", "userId") SELECT "currentStageId", "id", "questId", "status", "userId" FROM "UserQuest";
DROP TABLE "UserQuest";
ALTER TABLE "new_UserQuest" RENAME TO "UserQuest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key_key" ON "UserSetting"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterAiConfig_monsterId_key_key" ON "MonsterAiConfig"("monsterId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestProgress_userQuestId_key_key" ON "UserQuestProgress"("userQuestId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "GuildHistoryMetadata_historyId_key_key" ON "GuildHistoryMetadata"("historyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "GuildCreationReqData_templateId_key_key" ON "GuildCreationReqData"("templateId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "HeroHistoryPrimaryStat_historyId_key_key" ON "HeroHistoryPrimaryStat"("historyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "HeroHistorySecondaryStat_historyId_key_key" ON "HeroHistorySecondaryStat"("historyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "HeroHistoryEquippedItem_historyId_itemId_key" ON "HeroHistoryEquippedItem"("historyId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroHistoryActiveBuff_historyId_buffId_key" ON "HeroHistoryActiveBuff"("historyId", "buffId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonModifierStatMult_modifierId_key_key" ON "DungeonModifierStatMult"("modifierId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonModifierStatusEffect_modifierId_effectId_key" ON "DungeonModifierStatusEffect"("modifierId", "effectId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonFloorMonsterPool_floorId_monsterId_key" ON "DungeonFloorMonsterPool"("floorId", "monsterId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonEntryFloorProgress_entryId_floorId_key" ON "DungeonEntryFloorProgress"("entryId", "floorId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonEntryRewardClaim_entryId_rewardId_key" ON "DungeonEntryRewardClaim"("entryId", "rewardId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaMatchParticipant_matchId_playerId_key" ON "ArenaMatchParticipant"("matchId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaSeasonTopReward_seasonId_rankValue_key" ON "ArenaSeasonTopReward"("seasonId", "rankValue");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentPrize_tournamentId_rankValue_key" ON "TournamentPrize"("tournamentId", "rankValue");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAchievementTier_playerAchievId_tierValue_key" ON "PlayerAchievementTier"("playerAchievId", "tierValue");

