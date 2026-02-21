/*
  Warnings:

  - The primary key for the `SkillTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `SkillTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `MonsterCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `MonsterCategory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Guild` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Guild` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `templateId` on the `Guild` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `DialogueTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `DialogueTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `TraitTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `TraitTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `BuildingTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `BuildingTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `BehaviourTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `BehaviourTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `MonsterTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `categoryId` on the `MonsterTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `MonsterTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `InventoryItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `ownerHeroId` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `templateId` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `RaceBonusTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `RaceBonusTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `ItemTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ItemTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `setId` on the `ItemTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `UserRecipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserRecipe` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `recipeId` on the `UserRecipe` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `UserRecipe` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `UserAchievement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `achievementId` on the `UserAchievement` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `UserAchievement` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `UserAchievement` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `JobTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `JobTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `RegionTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `RegionTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `HallOfFame` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `HallOfFame` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `originalId` on the `HallOfFame` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `ClassTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ClassTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `StatusEffectTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `StatusEffectTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `GlobalEventTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `GlobalEventTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `AchievementTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `AchievementTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `QuestTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `QuestTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `prerequisiteQuestId` on the `QuestTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `requiredRegion` on the `QuestTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `ItemAffix` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ItemAffix` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `MarketHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `buyerId` on the `MarketHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `MarketHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `sellerId` on the `MarketHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `templateId` on the `MarketHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `GuildTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `GuildTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `MarketListing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `MarketListing` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `itemInstanceId` on the `MarketListing` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `sellerId` on the `MarketListing` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `templateId` on the `MarketListing` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `currentRegion` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `guildId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Hero` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `classId` on the `Hero` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `fatherId` on the `Hero` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `Hero` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `jobId` on the `Hero` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `motherId` on the `Hero` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `Hero` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `BuildingInstance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `BuildingInstance` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `regionId` on the `BuildingInstance` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `templateId` on the `BuildingInstance` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `RecipeTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `RecipeTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `requiredBuildingId` on the `RecipeTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `requiredJobId` on the `RecipeTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `resultItemId` on the `RecipeTemplate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `ItemSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ItemSet` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ATTACK',
    "element" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "manaCost" INTEGER NOT NULL DEFAULT 0,
    "staminaCost" INTEGER NOT NULL DEFAULT 0,
    "healthCost" INTEGER NOT NULL DEFAULT 0,
    "cooldown" INTEGER NOT NULL DEFAULT 3,
    "castTime" INTEGER NOT NULL DEFAULT 0,
    "damageFormula" TEXT NOT NULL DEFAULT '{}',
    "targetType" TEXT NOT NULL DEFAULT 'ENEMY',
    "aoePattern" TEXT NOT NULL DEFAULT 'SINGLE',
    "aoeSize" INTEGER NOT NULL DEFAULT 0,
    "range" INTEGER NOT NULL DEFAULT 1,
    "statusEffects" TEXT NOT NULL DEFAULT '[]',
    "vfxPath" TEXT NOT NULL DEFAULT '',
    "animationName" TEXT NOT NULL DEFAULT 'attack',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "filePath" TEXT NOT NULL DEFAULT 'skills/misc.json'
);
INSERT INTO "new_SkillTemplate" ("animationName", "aoePattern", "aoeSize", "castTime", "category", "cooldown", "damageFormula", "description", "element", "filePath", "healthCost", "id", "manaCost", "name", "range", "requirements", "staminaCost", "statusEffects", "targetType", "vfxPath") SELECT "animationName", "aoePattern", "aoeSize", "castTime", "category", "cooldown", "damageFormula", "description", "element", "filePath", "healthCost", "id", "manaCost", "name", "range", "requirements", "staminaCost", "statusEffects", "targetType", "vfxPath" FROM "SkillTemplate";
DROP TABLE "SkillTemplate";
ALTER TABLE "new_SkillTemplate" RENAME TO "SkillTemplate";
CREATE TABLE "new_MonsterCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_MonsterCategory" ("id", "name") SELECT "id", "name" FROM "MonsterCategory";
DROP TABLE "MonsterCategory";
ALTER TABLE "new_MonsterCategory" RENAME TO "MonsterCategory";
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    "unlockedPerks" TEXT NOT NULL DEFAULT '[]',
    "facilities" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("createdAt", "description", "exp", "facilities", "id", "level", "name", "templateId", "unlockedPerks", "vaultGold") SELECT "createdAt", "description", "exp", "facilities", "id", "level", "name", "templateId", "unlockedPerks", "vaultGold" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
CREATE TABLE "new_DialogueTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "branches" TEXT NOT NULL DEFAULT '[]',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "triggers" TEXT NOT NULL DEFAULT '[]',
    "mood" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "portraitPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'dialogues/misc.json'
);
INSERT INTO "new_DialogueTemplate" ("branches", "content", "filePath", "id", "mood", "npcId", "portraitPath", "requirements", "triggers") SELECT "branches", "content", "filePath", "id", "mood", "npcId", "portraitPath", "requirements", "triggers" FROM "DialogueTemplate";
DROP TABLE "DialogueTemplate";
ALTER TABLE "new_DialogueTemplate" RENAME TO "DialogueTemplate";
CREATE TABLE "new_TraitTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "type" TEXT NOT NULL DEFAULT 'NATURAL',
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "statModifiers" TEXT NOT NULL DEFAULT '{}',
    "elementalMods" TEXT NOT NULL DEFAULT '{}',
    "battleHooks" TEXT NOT NULL DEFAULT '{}',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "conflicts" TEXT NOT NULL DEFAULT '[]',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/traits/default.png',
    "vfxPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'traits/misc.json'
);
INSERT INTO "new_TraitTemplate" ("battleHooks", "category", "conflicts", "description", "elementalMods", "filePath", "iconPath", "id", "name", "rarity", "requirements", "statModifiers", "type", "vfxPath") SELECT "battleHooks", "category", "conflicts", "description", "elementalMods", "filePath", "iconPath", "id", "name", "rarity", "requirements", "statModifiers", "type", "vfxPath" FROM "TraitTemplate";
DROP TABLE "TraitTemplate";
ALTER TABLE "new_TraitTemplate" RENAME TO "TraitTemplate";
CREATE TABLE "new_BuildingTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ECONOMY',
    "upgradeTree" TEXT NOT NULL DEFAULT '[]',
    "perksPerLevel" TEXT NOT NULL DEFAULT '[]',
    "staffingLogic" TEXT NOT NULL DEFAULT '{}',
    "maintenance" TEXT NOT NULL DEFAULT '{}',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/buildings/default.png',
    "modelPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'buildings/misc.json'
);
INSERT INTO "new_BuildingTemplate" ("category", "description", "filePath", "iconPath", "id", "maintenance", "modelPath", "name", "perksPerLevel", "staffingLogic", "upgradeTree") SELECT "category", "description", "filePath", "iconPath", "id", "maintenance", "modelPath", "name", "perksPerLevel", "staffingLogic", "upgradeTree" FROM "BuildingTemplate";
DROP TABLE "BuildingTemplate";
ALTER TABLE "new_BuildingTemplate" RENAME TO "BuildingTemplate";
CREATE TABLE "new_BehaviourTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetWeights" TEXT NOT NULL DEFAULT '{}',
    "movementStyle" TEXT NOT NULL DEFAULT 'BALANCED',
    "tacticTriggers" TEXT NOT NULL DEFAULT '[]',
    "cohesionWeight" REAL NOT NULL DEFAULT 0.5,
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "filePath" TEXT NOT NULL DEFAULT 'behaviors/misc.json'
);
INSERT INTO "new_BehaviourTemplate" ("cohesionWeight", "description", "filePath", "id", "movementStyle", "name", "requirements", "tacticTriggers", "targetWeights") SELECT "cohesionWeight", "description", "filePath", "id", "movementStyle", "name", "requirements", "tacticTriggers", "targetWeights" FROM "BehaviourTemplate";
DROP TABLE "BehaviourTemplate";
ALTER TABLE "new_BehaviourTemplate" RENAME TO "BehaviourTemplate";
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "defense_base" INTEGER NOT NULL,
    "speed_base" INTEGER NOT NULL,
    "range_base" INTEGER NOT NULL,
    "exp_reward" INTEGER NOT NULL,
    "element" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "size" TEXT NOT NULL DEFAULT 'MEDIUM',
    "traits" TEXT NOT NULL DEFAULT '[]',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "immunities" TEXT NOT NULL DEFAULT '[]',
    "lootTable" TEXT NOT NULL DEFAULT '{}',
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json',
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "defense_base", "element", "exp_reward", "filePath", "hp_base", "id", "immunities", "lootTable", "name", "range_base", "size", "skills", "speed_base", "traits") SELECT "categoryId", "damage_base", "defense_base", "element", "exp_reward", "filePath", "hp_base", "id", "immunities", "lootTable", "name", "range_base", "size", "skills", "speed_base", "traits" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentDurability" INTEGER NOT NULL DEFAULT 100,
    "uniqueData" TEXT NOT NULL DEFAULT '{}',
    "sockets" TEXT NOT NULL DEFAULT '[]',
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "ownerHeroId" INTEGER,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("currentDurability", "id", "isEquipped", "ownerHeroId", "quantity", "sockets", "templateId", "uniqueData", "userId") SELECT "currentDurability", "id", "isEquipped", "ownerHeroId", "quantity", "sockets", "templateId", "uniqueData", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_RaceBonusTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bonusData" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'races/misc.json'
);
INSERT INTO "new_RaceBonusTemplate" ("bonusData", "filePath", "id") SELECT "bonusData", "filePath", "id" FROM "RaceBonusTemplate";
DROP TABLE "RaceBonusTemplate";
ALTER TABLE "new_RaceBonusTemplate" RENAME TO "RaceBonusTemplate";
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "subCategory" TEXT NOT NULL DEFAULT 'MISC',
    "baseDurability" INTEGER NOT NULL DEFAULT 100,
    "repairCostPerPt" INTEGER NOT NULL DEFAULT 1,
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "maxSockets" INTEGER NOT NULL DEFAULT 0,
    "allowedSockets" TEXT NOT NULL DEFAULT '[]',
    "setId" INTEGER,
    "isCraftable" BOOLEAN NOT NULL DEFAULT true,
    "salvageResult" TEXT NOT NULL DEFAULT '[]',
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/items/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'items/misc.json',
    CONSTRAINT "ItemTemplate_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ItemSet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("allowedSockets", "baseDurability", "baseStats", "category", "description", "filePath", "iconPath", "id", "isCraftable", "maxSockets", "name", "rarity", "repairCostPerPt", "requirements", "salvageResult", "setId", "subCategory") SELECT "allowedSockets", "baseDurability", "baseStats", "category", "description", "filePath", "iconPath", "id", "isCraftable", "maxSockets", "name", "rarity", "repairCostPerPt", "requirements", "salvageResult", "setId", "subCategory" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
CREATE TABLE "new_UserRecipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "craftCount" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" INTEGER NOT NULL DEFAULT 1,
    "masteryExp" INTEGER NOT NULL DEFAULT 0,
    "isDiscovered" BOOLEAN NOT NULL DEFAULT true,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "RecipeTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserRecipe" ("craftCount", "id", "isDiscovered", "masteryExp", "masteryLevel", "recipeId", "unlockedAt", "userId") SELECT "craftCount", "id", "isDiscovered", "masteryExp", "masteryLevel", "recipeId", "unlockedAt", "userId" FROM "UserRecipe";
DROP TABLE "UserRecipe";
ALTER TABLE "new_UserRecipe" RENAME TO "UserRecipe";
CREATE UNIQUE INDEX "UserRecipe_userId_recipeId_key" ON "UserRecipe"("userId", "recipeId");
CREATE TABLE "new_UserAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" DATETIME,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserAchievement" ("achievementId", "id", "isUnlocked", "progress", "unlockedAt", "userId") SELECT "achievementId", "id", "isUnlocked", "progress", "unlockedAt", "userId" FROM "UserAchievement";
DROP TABLE "UserAchievement";
ALTER TABLE "new_UserAchievement" RENAME TO "UserAchievement";
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE TABLE "new_JobTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COLLECTION',
    "workStats" TEXT NOT NULL DEFAULT '{}',
    "lootTable" TEXT NOT NULL DEFAULT '[]',
    "toolAccess" TEXT NOT NULL DEFAULT '{}',
    "masteryRewards" TEXT NOT NULL DEFAULT '{}',
    "passiveBonuses" TEXT NOT NULL DEFAULT '{}',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/jobs/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'jobs/misc.json'
);
INSERT INTO "new_JobTemplate" ("category", "description", "filePath", "iconPath", "id", "lootTable", "masteryRewards", "name", "passiveBonuses", "toolAccess", "workStats") SELECT "category", "description", "filePath", "iconPath", "id", "lootTable", "masteryRewards", "name", "passiveBonuses", "toolAccess", "workStats" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TOWN',
    "coordinates" TEXT NOT NULL DEFAULT '{"x": 0, "y": 0}',
    "connections" TEXT NOT NULL DEFAULT '[]',
    "environment" TEXT NOT NULL DEFAULT '{}',
    "economy" TEXT NOT NULL DEFAULT '{}',
    "resourceYield" TEXT NOT NULL DEFAULT '[]',
    "encounterPool" TEXT NOT NULL DEFAULT '[]',
    "entryReqs" TEXT NOT NULL DEFAULT '{}',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "backgroundPath" TEXT NOT NULL DEFAULT 'res://assets/backgrounds/default.png',
    "musicTrack" TEXT NOT NULL DEFAULT 'default_theme',
    "filePath" TEXT NOT NULL DEFAULT 'regions/misc.json'
);
INSERT INTO "new_RegionTemplate" ("backgroundPath", "connections", "coordinates", "dangerLevel", "description", "economy", "encounterPool", "entryReqs", "environment", "filePath", "id", "musicTrack", "name", "resourceYield", "type") SELECT "backgroundPath", "connections", "coordinates", "dangerLevel", "description", "economy", "encounterPool", "entryReqs", "environment", "filePath", "id", "musicTrack", "name", "resourceYield", "type" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_HallOfFame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalId" INTEGER NOT NULL,
    "ownerName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "classTier" INTEGER NOT NULL,
    "generation" INTEGER NOT NULL,
    "finalDeeds" TEXT NOT NULL,
    "deathDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "causeOfDeath" TEXT NOT NULL
);
INSERT INTO "new_HallOfFame" ("causeOfDeath", "classTier", "deathDate", "finalDeeds", "gender", "generation", "id", "level", "name", "originalId", "ownerName", "race") SELECT "causeOfDeath", "classTier", "deathDate", "finalDeeds", "gender", "generation", "id", "level", "name", "originalId", "ownerName", "race" FROM "HallOfFame";
DROP TABLE "HallOfFame";
ALTER TABLE "new_HallOfFame" RENAME TO "HallOfFame";
CREATE TABLE "new_ClassTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "statSystem" TEXT NOT NULL DEFAULT '{}',
    "masteries" TEXT NOT NULL DEFAULT '{}',
    "mechanics" TEXT NOT NULL DEFAULT '{}',
    "skillTree" TEXT NOT NULL DEFAULT '[]',
    "innateTraits" TEXT NOT NULL DEFAULT '[]',
    "promotionReqs" TEXT NOT NULL DEFAULT '{}',
    "nextClasses" TEXT NOT NULL DEFAULT '[]',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/classes/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'classes/misc.json'
);
INSERT INTO "new_ClassTemplate" ("description", "filePath", "iconPath", "id", "innateTraits", "masteries", "mechanics", "name", "nextClasses", "promotionReqs", "skillTree", "statSystem", "tier") SELECT "description", "filePath", "iconPath", "id", "innateTraits", "masteries", "mechanics", "name", "nextClasses", "promotionReqs", "skillTree", "statSystem", "tier" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
CREATE TABLE "new_StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'DEBUFF',
    "element" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "stackingRule" TEXT NOT NULL DEFAULT 'REFRESH',
    "maxStacks" INTEGER NOT NULL DEFAULT 1,
    "defaultDuration" INTEGER NOT NULL DEFAULT 3,
    "tickLogic" TEXT NOT NULL DEFAULT '{}',
    "statModifiers" TEXT NOT NULL DEFAULT '{}',
    "battleHooks" TEXT NOT NULL DEFAULT '{}',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/effects/default.png',
    "vfxPath" TEXT NOT NULL DEFAULT '',
    "applyVfxPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'effects/misc.json'
);
INSERT INTO "new_StatusEffectTemplate" ("applyVfxPath", "battleHooks", "defaultDuration", "description", "element", "filePath", "iconPath", "id", "maxStacks", "name", "stackingRule", "statModifiers", "tickLogic", "type", "vfxPath") SELECT "applyVfxPath", "battleHooks", "defaultDuration", "description", "element", "filePath", "iconPath", "id", "maxStacks", "name", "stackingRule", "statModifiers", "tickLogic", "type", "vfxPath" FROM "StatusEffectTemplate";
DROP TABLE "StatusEffectTemplate";
ALTER TABLE "new_StatusEffectTemplate" RENAME TO "StatusEffectTemplate";
CREATE TABLE "new_GlobalEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'WEATHER',
    "triggerType" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "worldModifiers" TEXT NOT NULL DEFAULT '{}',
    "combatModifiers" TEXT NOT NULL DEFAULT '{}',
    "specialSpawns" TEXT NOT NULL DEFAULT '[]',
    "targetScope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/events/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'events/misc.json'
);
INSERT INTO "new_GlobalEventTemplate" ("category", "combatModifiers", "description", "filePath", "iconPath", "id", "name", "specialSpawns", "targetScope", "triggerType", "worldModifiers") SELECT "category", "combatModifiers", "description", "filePath", "iconPath", "id", "name", "specialSpawns", "targetScope", "triggerType", "worldModifiers" FROM "GlobalEventTemplate";
DROP TABLE "GlobalEventTemplate";
ALTER TABLE "new_GlobalEventTemplate" RENAME TO "GlobalEventTemplate";
CREATE TABLE "new_AchievementTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "points" INTEGER NOT NULL DEFAULT 10,
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "rewards" TEXT NOT NULL DEFAULT '{}',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/achievements/default.png',
    "vfxPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'achievements/misc.json'
);
INSERT INTO "new_AchievementTemplate" ("category", "description", "filePath", "iconPath", "id", "isHidden", "name", "points", "requirements", "rewards", "vfxPath") SELECT "category", "description", "filePath", "iconPath", "id", "isHidden", "name", "points", "requirements", "rewards", "vfxPath" FROM "AchievementTemplate";
DROP TABLE "AchievementTemplate";
ALTER TABLE "new_AchievementTemplate" RENAME TO "AchievementTemplate";
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SIDE',
    "difficulty" TEXT NOT NULL DEFAULT 'NORMAL',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "prerequisiteQuestId" INTEGER,
    "objectives" TEXT NOT NULL DEFAULT '[]',
    "logicBranches" TEXT NOT NULL DEFAULT '{}',
    "rewards" TEXT NOT NULL DEFAULT '{}',
    "isTimeLimited" BOOLEAN NOT NULL DEFAULT false,
    "expiryHours" INTEGER NOT NULL DEFAULT 0,
    "requiredRegion" INTEGER,
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/quests/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'quests/misc.json'
);
INSERT INTO "new_QuestTemplate" ("category", "description", "difficulty", "expiryHours", "filePath", "iconPath", "id", "isTimeLimited", "logicBranches", "minLevel", "name", "objectives", "prerequisiteQuestId", "requiredRegion", "rewards") SELECT "category", "description", "difficulty", "expiryHours", "filePath", "iconPath", "id", "isTimeLimited", "logicBranches", "minLevel", "name", "objectives", "prerequisiteQuestId", "requiredRegion", "rewards" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
CREATE TABLE "new_ItemAffix" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PREFIX',
    "modifiers" TEXT NOT NULL DEFAULT '{}',
    "allowedCategories" TEXT NOT NULL DEFAULT '[]',
    "minItemLevel" INTEGER NOT NULL DEFAULT 1,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON'
);
INSERT INTO "new_ItemAffix" ("allowedCategories", "id", "minItemLevel", "modifiers", "name", "rarity", "type") SELECT "allowedCategories", "id", "minItemLevel", "modifiers", "name", "rarity", "type" FROM "ItemAffix";
DROP TABLE "ItemAffix";
ALTER TABLE "new_ItemAffix" RENAME TO "ItemAffix";
CREATE TABLE "new_MarketHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "soldPrice" INTEGER NOT NULL,
    "taxPaid" INTEGER NOT NULL DEFAULT 0,
    "soldAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL
);
INSERT INTO "new_MarketHistory" ("buyerId", "id", "quantity", "sellerId", "soldAt", "soldPrice", "taxPaid", "templateId") SELECT "buyerId", "id", "quantity", "sellerId", "soldAt", "soldPrice", "taxPaid", "templateId" FROM "MarketHistory";
DROP TABLE "MarketHistory";
ALTER TABLE "new_MarketHistory" RENAME TO "MarketHistory";
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePerks" TEXT NOT NULL DEFAULT '{}',
    "progressionTree" TEXT NOT NULL DEFAULT '[]',
    "creationReqs" TEXT NOT NULL DEFAULT '{}',
    "primaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/guilds/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'guilds/misc.json'
);
INSERT INTO "new_GuildTemplate" ("basePerks", "creationReqs", "description", "filePath", "iconPath", "id", "name", "primaryColor", "progressionTree") SELECT "basePerks", "creationReqs", "description", "filePath", "iconPath", "id", "name", "primaryColor", "progressionTree" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_MarketListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "pricePerUnit" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "isSold" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MarketListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MarketListing" ("createdAt", "expiresAt", "id", "isSold", "itemInstanceId", "pricePerUnit", "quantity", "sellerId", "templateId", "totalPrice") SELECT "createdAt", "expiresAt", "id", "isSold", "itemInstanceId", "pricePerUnit", "quantity", "sellerId", "templateId", "totalPrice" FROM "MarketListing";
DROP TABLE "MarketListing";
ALTER TABLE "new_MarketListing" RENAME TO "MarketListing";
CREATE UNIQUE INDEX "MarketListing_itemInstanceId_key" ON "MarketListing"("itemInstanceId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 500,
    "fame" INTEGER NOT NULL DEFAULT 0,
    "currentRegion" INTEGER NOT NULL DEFAULT 1,
    "guildId" INTEGER,
    "guildRole" TEXT NOT NULL DEFAULT 'MEMBER',
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("currentRegion", "fame", "gold", "guildId", "guildRole", "id", "password", "username") SELECT "currentRegion", "fame", "gold", "guildId", "guildRole", "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classId" INTEGER NOT NULL DEFAULT 1,
    "classTier" INTEGER NOT NULL DEFAULT 1,
    "jobId" INTEGER,
    "jobLevel" INTEGER NOT NULL DEFAULT 1,
    "jobExp" INTEGER NOT NULL DEFAULT 0,
    "jobRank" TEXT NOT NULL DEFAULT 'APPRENTICE',
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "naturalTraits" TEXT NOT NULL DEFAULT '[]',
    "acquiredTraits" TEXT NOT NULL DEFAULT '[]',
    "unlockedBehaviors" TEXT NOT NULL DEFAULT '[]',
    "activeBehavior" TEXT NOT NULL DEFAULT 'balanced',
    "deeds" TEXT NOT NULL DEFAULT '{}',
    "hasReproduced" BOOLEAN NOT NULL DEFAULT false,
    "fatherId" INTEGER,
    "motherId" INTEGER,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "equipment" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("acquiredTraits", "activeBehavior", "baseStats", "classId", "classTier", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "motherId", "name", "naturalTraits", "race", "unlockedBehaviors", "userId") SELECT "acquiredTraits", "activeBehavior", "baseStats", "classId", "classTier", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "jobExp", "jobId", "jobLevel", "jobRank", "level", "motherId", "name", "naturalTraits", "race", "unlockedBehaviors", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_BuildingInstance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "instanceData" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuildingInstance_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BuildingInstance" ("createdAt", "id", "instanceData", "level", "regionId", "templateId") SELECT "createdAt", "id", "instanceData", "level", "regionId", "templateId" FROM "BuildingInstance";
DROP TABLE "BuildingInstance";
ALTER TABLE "new_BuildingInstance" RENAME TO "BuildingInstance";
CREATE TABLE "new_RecipeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SMITHING',
    "resultItemId" INTEGER NOT NULL,
    "resultQuantity" INTEGER NOT NULL DEFAULT 1,
    "ingredients" TEXT NOT NULL DEFAULT '[]',
    "goldCost" INTEGER NOT NULL DEFAULT 0,
    "requiredFame" INTEGER NOT NULL DEFAULT 0,
    "requiredJobId" INTEGER,
    "minJobLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredBuildingId" INTEGER,
    "baseSuccessRate" REAL NOT NULL DEFAULT 1.0,
    "filePath" TEXT NOT NULL DEFAULT 'recipes/misc.json'
);
INSERT INTO "new_RecipeTemplate" ("baseSuccessRate", "category", "description", "filePath", "goldCost", "id", "ingredients", "minJobLevel", "name", "requiredBuildingId", "requiredFame", "requiredJobId", "resultItemId", "resultQuantity") SELECT "baseSuccessRate", "category", "description", "filePath", "goldCost", "id", "ingredients", "minJobLevel", "name", "requiredBuildingId", "requiredFame", "requiredJobId", "resultItemId", "resultQuantity" FROM "RecipeTemplate";
DROP TABLE "RecipeTemplate";
ALTER TABLE "new_RecipeTemplate" RENAME TO "RecipeTemplate";
CREATE TABLE "new_ItemSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "setBonuses" TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO "new_ItemSet" ("description", "id", "name", "setBonuses") SELECT "description", "id", "name", "setBonuses" FROM "ItemSet";
DROP TABLE "ItemSet";
ALTER TABLE "new_ItemSet" RENAME TO "ItemSet";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
