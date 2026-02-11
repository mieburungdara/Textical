-- CreateTable
CREATE TABLE "StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "MechanicTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "ReactionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "cooldown" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AuraTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "radius" INTEGER NOT NULL DEFAULT 1,
    "effect" TEXT NOT NULL,
    "vfxPath" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "SummonTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "spawnUnitId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "statScale" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "SummonTemplate_spawnUnitId_fkey" FOREIGN KEY ("spawnUnitId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnrageCondition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "threshold" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PhaseTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "threshold" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "MonsterTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    CONSTRAINT "MonsterTag_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "MechanicTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterSkill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "usageChance" REAL NOT NULL DEFAULT 1.0,
    "cooldown" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MonsterSkill_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterReaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "reactionId" INTEGER NOT NULL,
    "chance" REAL NOT NULL DEFAULT 1.0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MonsterReaction_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterReaction_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "ReactionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterAura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "auraId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MonsterAura_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterAura_auraId_fkey" FOREIGN KEY ("auraId") REFERENCES "AuraTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterSummon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "summonId" INTEGER NOT NULL,
    "chance" REAL NOT NULL DEFAULT 1.0,
    "maxActive" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MonsterSummon_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterSummon_summonId_fkey" FOREIGN KEY ("summonId") REFERENCES "SummonTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterImmunity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "statusEffectId" INTEGER NOT NULL,
    CONSTRAINT "MonsterImmunity_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterImmunity_statusEffectId_fkey" FOREIGN KEY ("statusEffectId") REFERENCES "StatusEffectTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterVulnerability" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "statusEffectId" INTEGER NOT NULL,
    "multiplier" REAL NOT NULL DEFAULT 1.5,
    CONSTRAINT "MonsterVulnerability_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterVulnerability_statusEffectId_fkey" FOREIGN KEY ("statusEffectId") REFERENCES "StatusEffectTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterEnrage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "enrageId" INTEGER NOT NULL,
    "stat_hp_bonus" REAL NOT NULL DEFAULT 0,
    "stat_dmg_bonus" REAL NOT NULL DEFAULT 0,
    "unlockSkillId" INTEGER,
    CONSTRAINT "MonsterEnrage_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterEnrage_enrageId_fkey" FOREIGN KEY ("enrageId") REFERENCES "EnrageCondition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterCompanion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "companionId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "spawnDelay" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MonsterCompanion_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterCompanion_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterPhase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "phaseOrder" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MonsterPhase_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterPhase_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "PhaseTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterFormation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "preferredRow" INTEGER NOT NULL DEFAULT 1,
    "preferredColumn" INTEGER NOT NULL DEFAULT 2,
    CONSTRAINT "MonsterFormation_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterTerritoryBonus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "regionTypeId" TEXT NOT NULL,
    "stat_multiplier" REAL NOT NULL DEFAULT 1.0,
    "immune_effect" TEXT,
    "bonus_effect" TEXT,
    CONSTRAINT "MonsterTerritoryBonus_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterTerritoryBonus_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "aiConfig" TEXT NOT NULL DEFAULT '{}',
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
INSERT INTO "new_MonsterTemplate" ("accuracy_base", "attack_speed", "behaviorTree", "block_chance", "block_power_base", "categoryId", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "defense_base", "dodge_rate", "hp_base", "id", "initiative_base", "lifesteal_base", "move_speed", "name", "range_base", "speed_base") SELECT "accuracy_base", "attack_speed", "behaviorTree", "block_chance", "block_power_base", "categoryId", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "defense_base", "dodge_rate", "hp_base", "id", "initiative_base", "lifesteal_base", "move_speed", "name", "range_base", "speed_base" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MechanicTag_name_key" ON "MechanicTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterTag_monsterId_tagId_key" ON "MonsterTag"("monsterId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterSkill_monsterId_skillId_key" ON "MonsterSkill"("monsterId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterReaction_monsterId_reactionId_key" ON "MonsterReaction"("monsterId", "reactionId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterAura_monsterId_auraId_key" ON "MonsterAura"("monsterId", "auraId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterSummon_monsterId_summonId_key" ON "MonsterSummon"("monsterId", "summonId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterImmunity_monsterId_statusEffectId_key" ON "MonsterImmunity"("monsterId", "statusEffectId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterVulnerability_monsterId_statusEffectId_key" ON "MonsterVulnerability"("monsterId", "statusEffectId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterEnrage_monsterId_enrageId_key" ON "MonsterEnrage"("monsterId", "enrageId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterCompanion_monsterId_companionId_key" ON "MonsterCompanion"("monsterId", "companionId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterPhase_monsterId_phaseId_key" ON "MonsterPhase"("monsterId", "phaseId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterFormation_monsterId_key" ON "MonsterFormation"("monsterId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterTerritoryBonus_monsterId_regionTypeId_key" ON "MonsterTerritoryBonus"("monsterId", "regionTypeId");
