/*
  Warnings:

  - You are about to drop the `AchievementCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BracketType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameMode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroStatAllocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroStatCap` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParticipantStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TournamentStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TournamentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WinCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `isActive` on the `Achievement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isHidden` on the `Achievement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isProgressive` on the `Achievement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isRanked` on the `ArenaMatch` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isActive` on the `ArenaSeason` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isComplete` on the `ArenaSeason` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `completedAt` on the `DungeonEntry` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `firstEnteredAt` on the `DungeonEntry` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `lastEnteredAt` on the `DungeonEntry` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `lastResetAt` on the `DungeonEntry` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `bossRequired` on the `DungeonFloor` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isRepeatable` on the `DungeonTemplate` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to drop the column `luk` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `vit` on the `Hero` table. All the data in the column will be lost.
  - You are about to alter the column `isPercent` on the `ItemEnchantment` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isCompleted` on the `PlayerAchievement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isDiscovered` on the `PlayerAchievement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `rewardsClaimed` on the `PlayerAchievement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isActive` on the `PlayerTitle` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to drop the column `lukGrowthCurve` on the `StatAllocationTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `lukGrowthFactor` on the `StatAllocationTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedLuk` on the `StatAllocationTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedVit` on the `StatAllocationTemplate` table. All the data in the column will be lost.
  - You are about to alter the column `checkedIn` on the `TournamentParticipant` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isEliminated` on the `TournamentParticipant` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - A unique constraint covering the columns `[name]` on the table `HeroBond` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "HeroStatAllocation_heroId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AchievementCategory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BracketType";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GameMode";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HeroStatAllocation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HeroStatCap";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MatchStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ParticipantStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TournamentStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TournamentType";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WinCondition";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🏆',
    "requirementType" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "counterName" TEXT NOT NULL,
    "isProgressive" BOOLEAN NOT NULL DEFAULT false,
    "tiers" TEXT,
    "rewardGold" INTEGER NOT NULL DEFAULT 0,
    "rewardGems" INTEGER NOT NULL DEFAULT 0,
    "rewardItems" TEXT,
    "rewardTitle" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenCondition" TEXT,
    "prereqCode" TEXT,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Achievement" ("category", "code", "counterName", "createdAt", "description", "hiddenCondition", "icon", "id", "isActive", "isHidden", "isProgressive", "minLevel", "name", "prereqCode", "requirementType", "rewardGems", "rewardGold", "rewardItems", "rewardTitle", "sortOrder", "targetValue", "tiers", "updatedAt") SELECT "category", "code", "counterName", "createdAt", "description", "hiddenCondition", "icon", "id", "isActive", "isHidden", "isProgressive", "minLevel", "name", "prereqCode", "requirementType", "rewardGems", "rewardGold", "rewardItems", "rewardTitle", "sortOrder", "targetValue", "tiers", "updatedAt" FROM "Achievement";
DROP TABLE "Achievement";
ALTER TABLE "new_Achievement" RENAME TO "Achievement";
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");
CREATE INDEX "Achievement_category_isActive_idx" ON "Achievement"("category", "isActive");
CREATE INDEX "Achievement_counterName_idx" ON "Achievement"("counterName");
CREATE TABLE "new_ArenaLeaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "gameMode" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "winRate" REAL NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "maxStreak" INTEGER NOT NULL DEFAULT 0,
    "spectatedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ArenaLeaderboard" ("currentStreak", "gameMode", "id", "losses", "maxStreak", "playerId", "rank", "rating", "seasonId", "spectatedCount", "updatedAt", "winRate", "wins") SELECT "currentStreak", "gameMode", "id", "losses", "maxStreak", "playerId", "rank", "rating", "seasonId", "spectatedCount", "updatedAt", "winRate", "wins" FROM "ArenaLeaderboard";
DROP TABLE "ArenaLeaderboard";
ALTER TABLE "new_ArenaLeaderboard" RENAME TO "ArenaLeaderboard";
CREATE INDEX "ArenaLeaderboard_seasonId_gameMode_rank_idx" ON "ArenaLeaderboard"("seasonId", "gameMode", "rank");
CREATE UNIQUE INDEX "ArenaLeaderboard_playerId_seasonId_gameMode_key" ON "ArenaLeaderboard"("playerId", "seasonId", "gameMode");
CREATE TABLE "new_ArenaMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchCode" TEXT NOT NULL,
    "gameMode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "playerIds" TEXT NOT NULL DEFAULT '[]',
    "teamAIds" TEXT NOT NULL DEFAULT '[]',
    "teamBIds" TEXT NOT NULL DEFAULT '[]',
    "winnerId" TEXT,
    "winCondition" TEXT,
    "scores" TEXT NOT NULL DEFAULT '{}',
    "ratingChanges" TEXT NOT NULL DEFAULT '{}',
    "queuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "duration" INTEGER,
    "seasonId" TEXT,
    "isRanked" BOOLEAN NOT NULL DEFAULT true,
    "battleId" TEXT
);
INSERT INTO "new_ArenaMatch" ("battleId", "duration", "endedAt", "gameMode", "id", "isRanked", "matchCode", "playerIds", "queuedAt", "ratingChanges", "scores", "seasonId", "startedAt", "status", "teamAIds", "teamBIds", "winCondition", "winnerId") SELECT "battleId", "duration", "endedAt", "gameMode", "id", "isRanked", "matchCode", "playerIds", "queuedAt", "ratingChanges", "scores", "seasonId", "startedAt", "status", "teamAIds", "teamBIds", "winCondition", "winnerId" FROM "ArenaMatch";
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
    "topRewards" TEXT NOT NULL DEFAULT '{}',
    "participation" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ArenaSeason" ("createdAt", "endDate", "id", "isActive", "isComplete", "name", "participation", "seasonNumber", "startDate", "topRewards") SELECT "createdAt", "endDate", "id", "isActive", "isComplete", "name", "participation", "seasonNumber", "startDate", "topRewards" FROM "ArenaSeason";
DROP TABLE "ArenaSeason";
ALTER TABLE "new_ArenaSeason" RENAME TO "ArenaSeason";
CREATE UNIQUE INDEX "ArenaSeason_seasonNumber_key" ON "ArenaSeason"("seasonNumber");
CREATE TABLE "new_CraftingLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "profession" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "itemRarity" TEXT NOT NULL,
    "successRate" REAL NOT NULL,
    "rolled" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CraftingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CraftingLog" ("createdAt", "id", "itemRarity", "outcome", "profession", "recipeId", "rolled", "successRate", "userId") SELECT "createdAt", "id", "itemRarity", "outcome", "profession", "recipeId", "rolled", "successRate", "userId" FROM "CraftingLog";
DROP TABLE "CraftingLog";
ALTER TABLE "new_CraftingLog" RENAME TO "CraftingLog";
CREATE INDEX "CraftingLog_userId_idx" ON "CraftingLog"("userId");
CREATE INDEX "CraftingLog_createdAt_idx" ON "CraftingLog"("createdAt");
CREATE TABLE "new_CraftingSkill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "profession" TEXT NOT NULL,
    "rank" TEXT NOT NULL DEFAULT 'NOVICE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "totalCrafts" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CraftingSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CraftingSkill" ("createdAt", "experience", "failCount", "id", "level", "profession", "rank", "successCount", "totalCrafts", "updatedAt", "userId") SELECT "createdAt", "experience", "failCount", "id", "level", "profession", "rank", "successCount", "totalCrafts", "updatedAt", "userId" FROM "CraftingSkill";
DROP TABLE "CraftingSkill";
ALTER TABLE "new_CraftingSkill" RENAME TO "CraftingSkill";
CREATE INDEX "CraftingSkill_userId_idx" ON "CraftingSkill"("userId");
CREATE UNIQUE INDEX "CraftingSkill_userId_profession_key" ON "CraftingSkill"("userId", "profession");
CREATE TABLE "new_DungeonEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "dungeonId" INTEGER NOT NULL,
    "currentFloor" INTEGER NOT NULL DEFAULT 1,
    "highestFloor" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "floorProgress" TEXT NOT NULL DEFAULT '{}',
    "firstEnteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEnteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "lastResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalGoldEarned" INTEGER NOT NULL DEFAULT 0,
    "totalXpEarned" INTEGER NOT NULL DEFAULT 0,
    "rewardsClaimed" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "DungeonEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DungeonEntry_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "DungeonTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DungeonEntry" ("attempts", "completedAt", "completions", "currentFloor", "dungeonId", "firstEnteredAt", "floorProgress", "highestFloor", "id", "lastEnteredAt", "lastResetAt", "rewardsClaimed", "totalGoldEarned", "totalXpEarned", "userId") SELECT "attempts", "completedAt", "completions", "currentFloor", "dungeonId", "firstEnteredAt", "floorProgress", "highestFloor", "id", "lastEnteredAt", "lastResetAt", "rewardsClaimed", "totalGoldEarned", "totalXpEarned", "userId" FROM "DungeonEntry";
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
    "monsterPoolIds" TEXT NOT NULL DEFAULT '[]',
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
INSERT INTO "new_DungeonFloor" ("bossRequired", "bossSpawnRate", "description", "dungeonId", "eliteSpawnRate", "floorNumber", "goldRewardScale", "gridHeight", "gridWidth", "id", "killCountRequired", "lootBonusScale", "monsterLevelScale", "monsterPoolIds", "name", "tileMapPath", "xpRewardScale") SELECT "bossRequired", "bossSpawnRate", "description", "dungeonId", "eliteSpawnRate", "floorNumber", "goldRewardScale", "gridHeight", "gridWidth", "id", "killCountRequired", "lootBonusScale", "monsterLevelScale", "monsterPoolIds", "name", "tileMapPath", "xpRewardScale" FROM "DungeonFloor";
DROP TABLE "DungeonFloor";
ALTER TABLE "new_DungeonFloor" RENAME TO "DungeonFloor";
CREATE UNIQUE INDEX "DungeonFloor_dungeonId_floorNumber_key" ON "DungeonFloor"("dungeonId", "floorNumber");
CREATE TABLE "new_DungeonFloorModifier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "floorId" INTEGER NOT NULL,
    "modifierId" INTEGER NOT NULL,
    "stackCount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "DungeonFloorModifier_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "DungeonFloor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DungeonFloorModifier_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "DungeonModifier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DungeonFloorModifier" ("floorId", "id", "modifierId", "stackCount") SELECT "floorId", "id", "modifierId", "stackCount" FROM "DungeonFloorModifier";
DROP TABLE "DungeonFloorModifier";
ALTER TABLE "new_DungeonFloorModifier" RENAME TO "DungeonFloorModifier";
CREATE UNIQUE INDEX "DungeonFloorModifier_floorId_modifierId_key" ON "DungeonFloorModifier"("floorId", "modifierId");
CREATE TABLE "new_DungeonTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dungeonKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "recommendedLevel" INTEGER NOT NULL DEFAULT 1,
    "recommendedItemPower" INTEGER NOT NULL DEFAULT 0,
    "requiredQuestId" INTEGER,
    "requiredAchievementId" INTEGER,
    "entryCost" INTEGER NOT NULL DEFAULT 0,
    "minPartySize" INTEGER NOT NULL DEFAULT 1,
    "maxPartySize" INTEGER NOT NULL DEFAULT 1,
    "scenePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "ambientMusicId" INTEGER,
    "baseGoldReward" INTEGER NOT NULL DEFAULT 100,
    "baseXpReward" INTEGER NOT NULL DEFAULT 50,
    "totalFloors" INTEGER NOT NULL DEFAULT 3,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT true,
    "resetType" TEXT NOT NULL DEFAULT 'DAILY'
);
INSERT INTO "new_DungeonTemplate" ("ambientMusicId", "baseGoldReward", "baseXpReward", "description", "difficulty", "dungeonKey", "entryCost", "id", "isRepeatable", "maxPartySize", "minPartySize", "name", "recommendedItemPower", "recommendedLevel", "requiredAchievementId", "requiredQuestId", "resetType", "scenePath", "thumbnailPath", "totalFloors") SELECT "ambientMusicId", "baseGoldReward", "baseXpReward", "description", "difficulty", "dungeonKey", "entryCost", "id", "isRepeatable", "maxPartySize", "minPartySize", "name", "recommendedItemPower", "recommendedLevel", "requiredAchievementId", "requiredQuestId", "resetType", "scenePath", "thumbnailPath", "totalFloors" FROM "DungeonTemplate";
DROP TABLE "DungeonTemplate";
ALTER TABLE "new_DungeonTemplate" RENAME TO "DungeonTemplate";
CREATE UNIQUE INDEX "DungeonTemplate_dungeonKey_key" ON "DungeonTemplate"("dungeonKey");
CREATE TABLE "new_GemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" REAL NOT NULL,
    "percentValue" REAL NOT NULL DEFAULT 0,
    "dropChance" REAL NOT NULL DEFAULT 0.01,
    "bossDropChance" REAL NOT NULL DEFAULT 0.1,
    "baseValue" INTEGER NOT NULL DEFAULT 100,
    "nextTierGemId" INTEGER,
    CONSTRAINT "GemTemplate_nextTierGemId_fkey" FOREIGN KEY ("nextTierGemId") REFERENCES "GemTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GemTemplate" ("baseValue", "bossDropChance", "description", "dropChance", "element", "id", "name", "nextTierGemId", "percentValue", "statKey", "statValue", "tier") SELECT "baseValue", "bossDropChance", "description", "dropChance", "element", "id", "name", "nextTierGemId", "percentValue", "statKey", "statValue", "tier" FROM "GemTemplate";
DROP TABLE "GemTemplate";
ALTER TABLE "new_GemTemplate" RENAME TO "GemTemplate";
CREATE UNIQUE INDEX "GemTemplate_nextTierGemId_key" ON "GemTemplate"("nextTierGemId");
CREATE INDEX "GemTemplate_element_idx" ON "GemTemplate"("element");
CREATE INDEX "GemTemplate_tier_idx" ON "GemTemplate"("tier");
CREATE UNIQUE INDEX "GemTemplate_element_tier_key" ON "GemTemplate"("element", "tier");
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL DEFAULT 'HUMAN',
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
    "def" INTEGER NOT NULL DEFAULT 10,
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
    CONSTRAINT "Hero_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Hero" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Hero" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("accuracy_base", "armor_penetration", "attack_speed", "block_chance", "block_power_base", "classId", "classLevel", "classXp", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "dark_damage", "defense_base", "dex", "dodge_chance", "earth_damage", "fatherId", "fire_damage", "generation", "hasOffspring", "hp_base", "hp_regen", "id", "initiative_base", "int", "isMain", "jobId", "level", "lifesteal_base", "light_damage", "mana_regen", "motherId", "move_speed", "name", "parry_chance", "race", "range_base", "skill_power_base", "speed_base", "spell_vamp", "str", "tenacity_base", "unitLevel", "unitXp", "userId", "vitality", "water_damage", "wind_damage", "xp") SELECT "accuracy_base", "armor_penetration", "attack_speed", "block_chance", "block_power_base", "classId", "classLevel", "classXp", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "dark_damage", "defense_base", "dex", "dodge_chance", "earth_damage", "fatherId", "fire_damage", "generation", "hasOffspring", "hp_base", "hp_regen", "id", "initiative_base", "int", "isMain", "jobId", "level", "lifesteal_base", "light_damage", "mana_regen", "motherId", "move_speed", "name", "parry_chance", "race", "range_base", "skill_power_base", "speed_base", "spell_vamp", "str", "tenacity_base", "unitLevel", "unitXp", "userId", "vitality", "water_damage", "wind_damage", "xp" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_InventoryItemEnchantment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryItemId" INTEGER NOT NULL,
    "enchantmentId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryItemEnchantment_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItemEnchantment_enchantmentId_fkey" FOREIGN KEY ("enchantmentId") REFERENCES "ItemEnchantment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItemEnchantment" ("appliedAt", "enchantmentId", "id", "inventoryItemId", "level") SELECT "appliedAt", "enchantmentId", "id", "inventoryItemId", "level" FROM "InventoryItemEnchantment";
DROP TABLE "InventoryItemEnchantment";
ALTER TABLE "new_InventoryItemEnchantment" RENAME TO "InventoryItemEnchantment";
CREATE UNIQUE INDEX "InventoryItemEnchantment_inventoryItemId_enchantmentId_key" ON "InventoryItemEnchantment"("inventoryItemId", "enchantmentId");
CREATE TABLE "new_InventoryItemSocket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryItemId" INTEGER NOT NULL,
    "gemId" INTEGER,
    "insertedAt" DATETIME,
    CONSTRAINT "InventoryItemSocket_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItemSocket_gemId_fkey" FOREIGN KEY ("gemId") REFERENCES "GemTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItemSocket" ("gemId", "id", "insertedAt", "inventoryItemId") SELECT "gemId", "id", "insertedAt", "inventoryItemId" FROM "InventoryItemSocket";
DROP TABLE "InventoryItemSocket";
ALTER TABLE "new_InventoryItemSocket" RENAME TO "InventoryItemSocket";
CREATE UNIQUE INDEX "InventoryItemSocket_inventoryItemId_key" ON "InventoryItemSocket"("inventoryItemId");
CREATE INDEX "InventoryItemSocket_gemId_idx" ON "InventoryItemSocket"("gemId");
CREATE TABLE "new_ItemEnchantment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValuePerLevel" REAL NOT NULL,
    "percentBonusPerLevel" REAL NOT NULL,
    "isPercent" BOOLEAN NOT NULL DEFAULT false,
    "condition" TEXT,
    "materialId" INTEGER,
    "materialCount" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 10,
    "baseSuccessRate" REAL NOT NULL DEFAULT 0.8
);
INSERT INTO "new_ItemEnchantment" ("baseSuccessRate", "category", "condition", "description", "id", "isPercent", "materialCount", "materialId", "maxLevel", "name", "percentBonusPerLevel", "statKey", "statValuePerLevel") SELECT "baseSuccessRate", "category", "condition", "description", "id", "isPercent", "materialCount", "materialId", "maxLevel", "name", "percentBonusPerLevel", "statKey", "statValuePerLevel" FROM "ItemEnchantment";
DROP TABLE "ItemEnchantment";
ALTER TABLE "new_ItemEnchantment" RENAME TO "ItemEnchantment";
CREATE TABLE "new_PlayerAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "achievementCode" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "currentTier" INTEGER NOT NULL DEFAULT 0,
    "unlockedTiers" TEXT NOT NULL DEFAULT '[]',
    "rewardsClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" DATETIME,
    "isDiscovered" BOOLEAN NOT NULL DEFAULT false,
    "discoveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerAchievement_achievementCode_fkey" FOREIGN KEY ("achievementCode") REFERENCES "Achievement" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlayerAchievement" ("achievementCode", "claimedAt", "completedAt", "createdAt", "currentTier", "currentValue", "discoveredAt", "id", "isCompleted", "isDiscovered", "rewardsClaimed", "unlockedTiers", "updatedAt", "userId") SELECT "achievementCode", "claimedAt", "completedAt", "createdAt", "currentTier", "currentValue", "discoveredAt", "id", "isCompleted", "isDiscovered", "rewardsClaimed", "unlockedTiers", "updatedAt", "userId" FROM "PlayerAchievement";
DROP TABLE "PlayerAchievement";
ALTER TABLE "new_PlayerAchievement" RENAME TO "PlayerAchievement";
CREATE INDEX "PlayerAchievement_userId_idx" ON "PlayerAchievement"("userId");
CREATE UNIQUE INDEX "PlayerAchievement_userId_achievementCode_key" ON "PlayerAchievement"("userId", "achievementCode");
CREATE TABLE "new_PlayerTitle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🎖️',
    "badgeColor" TEXT NOT NULL DEFAULT '#ffffff',
    "source" TEXT NOT NULL,
    "sourceCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PlayerTitle" ("activatedAt", "badgeColor", "createdAt", "icon", "id", "isActive", "source", "sourceCode", "title", "userId") SELECT "activatedAt", "badgeColor", "createdAt", "icon", "id", "isActive", "source", "sourceCode", "title", "userId" FROM "PlayerTitle";
DROP TABLE "PlayerTitle";
ALTER TABLE "new_PlayerTitle" RENAME TO "PlayerTitle";
CREATE INDEX "PlayerTitle_userId_idx" ON "PlayerTitle"("userId");
CREATE UNIQUE INDEX "PlayerTitle_userId_title_key" ON "PlayerTitle"("userId", "title");
CREATE TABLE "new_StatAllocationTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classId" INTEGER NOT NULL,
    "strGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "dexGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "intGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "vitGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "defGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "strGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "dexGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "intGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "vitGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "defGrowthFactor" REAL NOT NULL DEFAULT 1.0,
    "basePointsPerLevel" INTEGER NOT NULL DEFAULT 5,
    "maxStatCap" INTEGER NOT NULL DEFAULT 255,
    "recommendedStr" INTEGER NOT NULL DEFAULT 10,
    "recommendedDex" INTEGER NOT NULL DEFAULT 10,
    "recommendedInt" INTEGER NOT NULL DEFAULT 10,
    "recommendedDef" INTEGER NOT NULL DEFAULT 10
);
INSERT INTO "new_StatAllocationTemplate" ("basePointsPerLevel", "classId", "dexGrowthCurve", "dexGrowthFactor", "id", "intGrowthCurve", "intGrowthFactor", "maxStatCap", "recommendedDex", "recommendedInt", "recommendedStr", "strGrowthCurve", "strGrowthFactor", "vitGrowthCurve", "vitGrowthFactor") SELECT "basePointsPerLevel", "classId", "dexGrowthCurve", "dexGrowthFactor", "id", "intGrowthCurve", "intGrowthFactor", "maxStatCap", "recommendedDex", "recommendedInt", "recommendedStr", "strGrowthCurve", "strGrowthFactor", "vitGrowthCurve", "vitGrowthFactor" FROM "StatAllocationTemplate";
DROP TABLE "StatAllocationTemplate";
ALTER TABLE "new_StatAllocationTemplate" RENAME TO "StatAllocationTemplate";
CREATE UNIQUE INDEX "StatAllocationTemplate_classId_key" ON "StatAllocationTemplate"("classId");
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
    "prizePool" TEXT NOT NULL DEFAULT '{}',
    "participationReward" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REGISTRATION',
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Tournament" ("bracketType", "createdAt", "currentParticipants", "endDate", "entryFee", "id", "maxParticipants", "minLevel", "name", "participationReward", "prizePool", "registrationEnd", "registrationStart", "startDate", "status", "type", "winnerId") SELECT "bracketType", "createdAt", "currentParticipants", "endDate", "entryFee", "id", "maxParticipants", "minLevel", "name", "participationReward", "prizePool", "registrationEnd", "registrationStart", "startDate", "status", "type", "winnerId" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
CREATE INDEX "Tournament_status_startDate_idx" ON "Tournament"("status", "startDate");
CREATE TABLE "new_TournamentBracket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "bracketData" TEXT NOT NULL,
    "currentRound" INTEGER NOT NULL,
    "activeMatches" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TournamentBracket_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TournamentBracket" ("activeMatches", "bracketData", "currentRound", "id", "tournamentId", "updatedAt") SELECT "activeMatches", "bracketData", "currentRound", "id", "tournamentId", "updatedAt" FROM "TournamentBracket";
DROP TABLE "TournamentBracket";
ALTER TABLE "new_TournamentBracket" RENAME TO "TournamentBracket";
CREATE UNIQUE INDEX "TournamentBracket_tournamentId_key" ON "TournamentBracket"("tournamentId");
CREATE TABLE "new_TournamentMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "bracketType" TEXT NOT NULL DEFAULT 'SINGLE_ELIMINATION',
    "playerAId" TEXT,
    "playerBId" TEXT,
    "winnerId" TEXT,
    "scoreA" INTEGER NOT NULL DEFAULT 0,
    "scoreB" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "arenaMatchId" TEXT,
    "nextMatchId" TEXT,
    "loserNextMatchId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    CONSTRAINT "TournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TournamentMatch" ("arenaMatchId", "bracketType", "completedAt", "id", "loserNextMatchId", "matchNumber", "nextMatchId", "playerAId", "playerBId", "round", "scheduledAt", "scoreA", "scoreB", "startedAt", "status", "tournamentId", "winnerId") SELECT "arenaMatchId", "bracketType", "completedAt", "id", "loserNextMatchId", "matchNumber", "nextMatchId", "playerAId", "playerBId", "round", "scheduledAt", "scoreA", "scoreB", "startedAt", "status", "tournamentId", "winnerId" FROM "TournamentMatch";
DROP TABLE "TournamentMatch";
ALTER TABLE "new_TournamentMatch" RENAME TO "TournamentMatch";
CREATE INDEX "TournamentMatch_tournamentId_round_idx" ON "TournamentMatch"("tournamentId", "round");
CREATE INDEX "TournamentMatch_status_idx" ON "TournamentMatch"("status");
CREATE TABLE "new_TournamentParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "elo" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "isEliminated" BOOLEAN NOT NULL DEFAULT false,
    "bracketPosition" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentParticipant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TournamentParticipant" ("bracketPosition", "checkedIn", "createdAt", "currentRound", "elo", "id", "isEliminated", "losses", "playerId", "seed", "status", "tournamentId", "wins") SELECT "bracketPosition", "checkedIn", "createdAt", "currentRound", "elo", "id", "isEliminated", "losses", "playerId", "seed", "status", "tournamentId", "wins" FROM "TournamentParticipant";
DROP TABLE "TournamentParticipant";
ALTER TABLE "new_TournamentParticipant" RENAME TO "TournamentParticipant";
CREATE INDEX "TournamentParticipant_tournamentId_seed_idx" ON "TournamentParticipant"("tournamentId", "seed");
CREATE UNIQUE INDEX "TournamentParticipant_tournamentId_playerId_key" ON "TournamentParticipant"("tournamentId", "playerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "HeroBond_name_key" ON "HeroBond"("name");

