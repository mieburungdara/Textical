-- AlterTable
ALTER TABLE "QuestReward" ADD COLUMN "factionId" INTEGER;

-- AlterTable
ALTER TABLE "RegionResource" ADD COLUMN "active_time" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AchievementTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🏆',
    "category" TEXT NOT NULL DEFAULT 'GENERAL'
);
INSERT INTO "new_AchievementTemplate" ("category", "description", "icon", "id", "name") SELECT "category", "description", "icon", "id", "name" FROM "AchievementTemplate";
DROP TABLE "AchievementTemplate";
ALTER TABLE "new_AchievementTemplate" RENAME TO "AchievementTemplate";
CREATE TABLE "new_ClassTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "resourceType" TEXT NOT NULL DEFAULT 'MANA',
    "focus" TEXT NOT NULL DEFAULT 'General',
    "identity" TEXT NOT NULL DEFAULT 'A versatile starting point.',
    "description" TEXT NOT NULL DEFAULT '',
    "growthDesc" TEXT NOT NULL DEFAULT 'Balanced growth across all stats.',
    "mechanicDesc" TEXT NOT NULL DEFAULT 'Uses standard Mana.',
    "hpGrowth" REAL NOT NULL DEFAULT 5,
    "mpGrowth" REAL NOT NULL DEFAULT 2,
    "atkGrowth" REAL NOT NULL DEFAULT 1,
    "defGrowth" REAL NOT NULL DEFAULT 0.5,
    "spdGrowth" REAL NOT NULL DEFAULT 0.1,
    "promotionReqLevel" INTEGER NOT NULL DEFAULT 20,
    "parentClassId" INTEGER,
    CONSTRAINT "ClassTemplate_parentClassId_fkey" FOREIGN KEY ("parentClassId") REFERENCES "ClassTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ClassTemplate" ("atkGrowth", "defGrowth", "description", "focus", "growthDesc", "hpGrowth", "id", "identity", "mechanicDesc", "mpGrowth", "name", "parentClassId", "promotionReqLevel", "resourceType", "spdGrowth", "tier") SELECT "atkGrowth", "defGrowth", "description", "focus", "growthDesc", "hpGrowth", "id", "identity", "mechanicDesc", "mpGrowth", "name", "parentClassId", "promotionReqLevel", "resourceType", "spdGrowth", "tier" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
CREATE TABLE "new_DialogueNode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "npcId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isRoot" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DialogueNode_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DialogueNode" ("id", "isRoot", "npcId", "text") SELECT "id", "isRoot", "npcId", "text" FROM "DialogueNode";
DROP TABLE "DialogueNode";
ALTER TABLE "new_DialogueNode" RENAME TO "DialogueNode";
CREATE TABLE "new_Faction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_Faction" ("description", "id", "name") SELECT "description", "id", "name" FROM "Faction";
DROP TABLE "Faction";
ALTER TABLE "new_Faction" RENAME TO "Faction";
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentDurability" INTEGER NOT NULL DEFAULT 100,
    "maxDurability" INTEGER NOT NULL DEFAULT 100,
    "isTrash" BOOLEAN NOT NULL DEFAULT false,
    "isCursed" BOOLEAN NOT NULL DEFAULT false,
    "quality" TEXT NOT NULL DEFAULT 'COMMON',
    "powerScale" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("currentDurability", "id", "isTrash", "maxDurability", "powerScale", "quality", "quantity", "templateId", "userId") SELECT "currentDurability", "id", "isTrash", "maxDurability", "powerScale", "quality", "quantity", "templateId", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "isTwoHanded" BOOLEAN NOT NULL DEFAULT false,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "isQuestItem" BOOLEAN NOT NULL DEFAULT false,
    "hardness" INTEGER NOT NULL DEFAULT 1,
    "minStr" INTEGER NOT NULL DEFAULT 0,
    "minToolTier" INTEGER NOT NULL DEFAULT 0,
    "toolTier" INTEGER NOT NULL DEFAULT 0,
    "elementalAffinity" INTEGER NOT NULL DEFAULT 0,
    "masteryClassId" INTEGER,
    "masteryXpAmount" INTEGER,
    CONSTRAINT "ItemTemplate_masteryClassId_fkey" FOREIGN KEY ("masteryClassId") REFERENCES "ClassTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("baseValue", "category", "description", "elementalAffinity", "hardness", "id", "isTwoHanded", "masteryClassId", "masteryXpAmount", "maxStack", "minStr", "minToolTier", "name", "rarity", "toolTier") SELECT "baseValue", "category", "description", "elementalAffinity", "hardness", "id", "isTwoHanded", "masteryClassId", "masteryXpAmount", "maxStack", "minStr", "minToolTier", "name", "rarity", "toolTier" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
CREATE TABLE "new_Mail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiverId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Mail_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mail" ("expiresAt", "id", "receiverId", "subject") SELECT "expiresAt", "id", "receiverId", "subject" FROM "Mail";
DROP TABLE "Mail";
ALTER TABLE "new_Mail" RENAME TO "Mail";
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
INSERT INTO "new_MonsterTemplate" ("accuracy_base", "active_time", "aiConfig", "aiScript", "attack_element", "attack_speed", "behaviorTree", "block_chance", "block_power_base", "categoryId", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "damage_growth", "defense_base", "defense_growth", "description", "dialoguePack", "dodge_rate", "goldReward", "gridSize", "hp_base", "hp_growth", "iconPath", "id", "initiative_base", "level", "lifesteal_base", "modelPath", "modelScale", "move_speed", "movementType", "name", "preferred_target", "preferred_weather", "race", "range_base", "rank", "res_dark", "res_earth", "res_fire", "res_light", "res_water", "res_wind", "sfx_attack", "sfx_die", "sfx_hit", "shortDesc", "size", "speed_base", "threat_modifier", "xpReward") SELECT "accuracy_base", "active_time", "aiConfig", "aiScript", "attack_element", "attack_speed", "behaviorTree", "block_chance", "block_power_base", "categoryId", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "damage_growth", "defense_base", "defense_growth", "description", "dialoguePack", "dodge_rate", "goldReward", "gridSize", "hp_base", "hp_growth", "iconPath", "id", "initiative_base", "level", "lifesteal_base", "modelPath", "modelScale", "move_speed", "movementType", "name", "preferred_target", "preferred_weather", "race", "range_base", "rank", "res_dark", "res_earth", "res_fire", "res_light", "res_water", "res_wind", "sfx_attack", "sfx_die", "sfx_hit", "shortDesc", "size", "speed_base", "threat_modifier", "xpReward" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_NPCTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isWanderer" BOOLEAN NOT NULL DEFAULT false,
    "healCost" INTEGER,
    "betMultiplier" REAL,
    "betWinChance" REAL,
    "travelCost" INTEGER,
    "factionId" INTEGER,
    "active_time" TEXT,
    CONSTRAINT "NPCTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_NPCTemplate" ("betMultiplier", "betWinChance", "description", "factionId", "healCost", "id", "isWanderer", "name", "title", "travelCost", "type") SELECT "betMultiplier", "betWinChance", "description", "factionId", "healCost", "id", "isWanderer", "name", "title", "travelCost", "type" FROM "NPCTemplate";
DROP TABLE "NPCTemplate";
ALTER TABLE "new_NPCTemplate" RENAME TO "NPCTemplate";
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'MAIN',
    "minReputation" INTEGER NOT NULL DEFAULT 0,
    "factionId" INTEGER,
    "questGiverId" INTEGER,
    "turnInNpcId" INTEGER,
    "isDynamic" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    CONSTRAINT "QuestTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuestTemplate_questGiverId_fkey" FOREIGN KEY ("questGiverId") REFERENCES "NPCTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuestTemplate_turnInNpcId_fkey" FOREIGN KEY ("turnInNpcId") REFERENCES "NPCTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QuestTemplate" ("description", "expiresAt", "factionId", "id", "isDynamic", "minReputation", "name") SELECT "description", "expiresAt", "factionId", "id", "isDynamic", "minReputation", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
CREATE TABLE "new_RecipeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resultItemId" INTEGER NOT NULL,
    "craftTimeSeconds" INTEGER NOT NULL DEFAULT 30,
    CONSTRAINT "RecipeTemplate_resultItemId_fkey" FOREIGN KEY ("resultItemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeTemplate" ("craftTimeSeconds", "description", "id", "name", "resultItemId") SELECT "craftTimeSeconds", "description", "id", "name", "resultItemId" FROM "RecipeTemplate";
DROP TABLE "RecipeTemplate";
ALTER TABLE "new_RecipeTemplate" RENAME TO "RecipeTemplate";
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
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
INSERT INTO "new_RegionTemplate" ("description", "factionId", "id", "name", "regionTypeId", "regionalTaxRate", "specialization", "visualType", "weatherOverride", "zoneLevel", "zoneType") SELECT "description", "factionId", "id", "name", "regionTypeId", "regionalTaxRate", "specialization", "visualType", "weatherOverride", "zoneLevel", "zoneType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statKey" TEXT,
    "statValue" REAL,
    "power" REAL,
    "duration" INTEGER,
    "multiplier" REAL,
    "manaCost" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_SkillTemplate" ("category", "description", "duration", "id", "manaCost", "multiplier", "name", "power", "statKey", "statValue", "type") SELECT "category", "description", "duration", "id", "manaCost", "multiplier", "name", "power", "statKey", "statValue", "type" FROM "SkillTemplate";
DROP TABLE "SkillTemplate";
ALTER TABLE "new_SkillTemplate" RENAME TO "SkillTemplate";
CREATE TABLE "new_UserQuest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "currentStageId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "progressData" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "QuestStage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserQuest" ("currentStageId", "id", "questId", "status", "userId") SELECT "currentStageId", "id", "questId", "status", "userId" FROM "UserQuest";
DROP TABLE "UserQuest";
ALTER TABLE "new_UserQuest" RENAME TO "UserQuest";
CREATE TABLE "new_WorldEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "combatAtkMult" REAL,
    "combatDefMult" REAL,
    "miningYieldMult" REAL,
    "lumberingYieldMult" REAL,
    "herbalismYieldMult" REAL,
    "fishingYieldMult" REAL,
    "expGainMult" REAL,
    "lootChanceMult" REAL,
    "statIntBonus" INTEGER,
    "dangerLevelBonus" INTEGER
);
INSERT INTO "new_WorldEventTemplate" ("combatAtkMult", "combatDefMult", "dangerLevelBonus", "description", "expGainMult", "fishingYieldMult", "herbalismYieldMult", "id", "lootChanceMult", "lumberingYieldMult", "miningYieldMult", "name", "statIntBonus") SELECT "combatAtkMult", "combatDefMult", "dangerLevelBonus", "description", "expGainMult", "fishingYieldMult", "herbalismYieldMult", "id", "lootChanceMult", "lumberingYieldMult", "miningYieldMult", "name", "statIntBonus" FROM "WorldEventTemplate";
DROP TABLE "WorldEventTemplate";
ALTER TABLE "new_WorldEventTemplate" RENAME TO "WorldEventTemplate";
CREATE TABLE "new_WorldState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "currentHour" INTEGER NOT NULL DEFAULT 12,
    "weatherType" TEXT NOT NULL DEFAULT 'CLEAR',
    "moonPhase" TEXT NOT NULL DEFAULT 'NEW',
    "lastTick" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_WorldState" ("currentHour", "id", "lastTick", "weatherType") SELECT "currentHour", "id", "lastTick", "weatherType" FROM "WorldState";
DROP TABLE "WorldState";
ALTER TABLE "new_WorldState" RENAME TO "WorldState";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
