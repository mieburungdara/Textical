/*
  Warnings:

  - You are about to drop the column `buyoutPrice` on the `HeroAuctionListing` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `HeroAuctionListing` table. All the data in the column will be lost.
  - You are about to drop the column `currentBid` on the `HeroAuctionListing` table. All the data in the column will be lost.
  - You are about to drop the column `regionId` on the `HeroAuctionListing` table. All the data in the column will be lost.
  - You are about to drop the column `statModifiers` on the `ItemSetBonus` table. All the data in the column will be lost.
  - You are about to drop the column `cohesionWeight` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `movementStyle` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `tacticTriggers` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `targetWeights` on the `BehaviourTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `branches` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `mood` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `portraitPath` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `triggers` on the `DialogueTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `maintenance` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `modelPath` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `perksPerLevel` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `staffingLogic` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `upgradeTree` on the `BuildingTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `causeOfDeath` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `classTier` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `deathDate` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `finalDeeds` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `generation` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `originalId` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `ownerName` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `race` on the `HallOfFame` table. All the data in the column will be lost.
  - You are about to drop the column `basePerks` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `creationReqs` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `progressionTree` on the `GuildTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `activeBehavior` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `baseStats` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `deeds` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `equipment` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `fatherId` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `generation` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `hasReproduced` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `jobExp` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `jobLevel` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `jobRank` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `motherId` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `race` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `UserAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `unlockedAt` on the `UserAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `acceptedAt` on the `UserQuest` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `UserQuest` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `QuestObjective` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `EventSpawn` table. All the data in the column will be lost.
  - You are about to drop the column `instanceData` on the `BuildingInstance` table. All the data in the column will be lost.
  - You are about to drop the column `isSeen` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `battleHooks` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `conflicts` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `elementalMods` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `rarity` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `statModifiers` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `vfxPath` on the `TraitTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `copper` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `gold` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `isClaimed` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `mithril` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `platinum` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `silver` on the `Mail` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `RaceBonusTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `exp` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `facilities` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `taxIncomeTotal` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `unlockedPerks` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ItemSet` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MarketListing` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `MarketListing` table. All the data in the column will be lost.
  - You are about to drop the column `isSold` on the `MarketListing` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `MarketListing` table. All the data in the column will be lost.
  - You are about to drop the column `baseSuccessRate` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `goldCost` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `minJobLevel` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredBuildingId` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredFame` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredJobId` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `resultQuantity` on the `RecipeTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `applyVfxPath` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `battleHooks` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `defaultDuration` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `element` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `maxStacks` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `stackingRule` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `statModifiers` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `tickLogic` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `vfxPath` on the `StatusEffectTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `craftCount` on the `UserRecipe` table. All the data in the column will be lost.
  - You are about to drop the column `isDiscovered` on the `UserRecipe` table. All the data in the column will be lost.
  - You are about to drop the column `masteryExp` on the `UserRecipe` table. All the data in the column will be lost.
  - You are about to drop the column `masteryLevel` on the `UserRecipe` table. All the data in the column will be lost.
  - You are about to drop the column `unlockedAt` on the `UserRecipe` table. All the data in the column will be lost.
  - You are about to drop the column `animationName` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `aoePattern` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `aoeSize` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `castTime` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `cooldown` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `damageFormula` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `element` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `healthCost` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `manaCost` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `range` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `staminaCost` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `statusEffects` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `vfxPath` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueData` on the `MailAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `expiryHours` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isTimeLimited` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `logicBranches` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `minLevel` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `prerequisiteQuestId` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredRegion` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `rewards` on the `QuestTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `combatModifiers` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `targetScope` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `triggerType` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `worldModifiers` on the `GlobalEventTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `lootTable` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `masteryRewards` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `passiveBonuses` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `toolAccess` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `workStats` on the `JobTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Siege` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Siege` table. All the data in the column will be lost.
  - You are about to drop the column `warLog` on the `Siege` table. All the data in the column will be lost.
  - You are about to drop the column `winnerGuildId` on the `Siege` table. All the data in the column will be lost.
  - You are about to drop the column `buyerId` on the `MarketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `MarketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `MarketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `soldAt` on the `MarketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `soldPrice` on the `MarketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `taxPaid` on the `MarketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `innateTraits` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `masteries` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `mechanics` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `nextClasses` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `promotionReqs` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `skillTree` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `statSystem` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isEquipped` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `ownerHeroId` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `sockets` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueData` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `connections` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `economy` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `encounterPool` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `entryReqs` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `environment` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `resourceYield` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isHidden` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `rewards` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `vfxPath` on the `AchievementTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `bidAt` on the `HeroBid` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `UserQuestObjective` table. All the data in the column will be lost.
  - You are about to drop the column `allowedSockets` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `baseStats` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `iconPath` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `isCraftable` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `maxSockets` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `rarity` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `repairCostPerPt` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `salvageResult` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `subCategory` on the `ItemTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `defense_base` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `element` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `exp_reward` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `immunities` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `lootTable` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `range_base` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `speed_base` on the `MonsterTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `traits` on the `MonsterTemplate` table. All the data in the column will be lost.
  - Added the required column `statKey` to the `ItemSetBonus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statValue` to the `ItemSetBonus` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RegionConnection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originRegionId" INTEGER NOT NULL,
    "targetRegionId" INTEGER NOT NULL,
    CONSTRAINT "RegionConnection_originRegionId_fkey" FOREIGN KEY ("originRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionConnection_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuildingUpgrade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "goldCost" INTEGER NOT NULL,
    "fameRequired" INTEGER NOT NULL,
    CONSTRAINT "BuildingUpgrade_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuildingPerk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "levelRequired" INTEGER NOT NULL,
    "perkKey" TEXT NOT NULL,
    "value" REAL NOT NULL,
    CONSTRAINT "BuildingPerk_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassStatGrowth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "growthValue" REAL NOT NULL,
    "statCap" INTEGER NOT NULL,
    CONSTRAINT "ClassStatGrowth_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassSkillUnlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classId" INTEGER NOT NULL,
    "levelRequired" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    CONSTRAINT "ClassSkillUnlock_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassPromotionPath" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prevClassId" INTEGER NOT NULL,
    "nextClassId" INTEGER NOT NULL,
    CONSTRAINT "ClassPromotionPath_prevClassId_fkey" FOREIGN KEY ("prevClassId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClassPromotionPath_nextClassId_fkey" FOREIGN KEY ("nextClassId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemRequirement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "reqKey" TEXT NOT NULL,
    "reqValue" INTEGER NOT NULL,
    CONSTRAINT "ItemRequirement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterTraitUnlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    CONSTRAINT "MonsterTraitUnlock_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterLootEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "chance" REAL NOT NULL,
    CONSTRAINT "MonsterLootEntry_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TraitStatModifier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "traitId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "modifierValue" REAL NOT NULL,
    CONSTRAINT "TraitStatModifier_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BehaviourWeight" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "behaviourId" INTEGER NOT NULL,
    "targetKey" TEXT NOT NULL,
    "weightValue" INTEGER NOT NULL,
    CONSTRAINT "BehaviourWeight_behaviourId_fkey" FOREIGN KEY ("behaviourId") REFERENCES "BehaviourTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestReward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "QuestReward_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "HeroStat_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroEquipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "slotKey" TEXT NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,
    CONSTRAINT "HeroEquipment_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HeroAuctionListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "startingPrice" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HeroAuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroAuctionListing" ("expiresAt", "heroId", "id", "isFinished", "sellerId", "startingPrice", "templateId") SELECT "expiresAt", "heroId", "id", "isFinished", "sellerId", "startingPrice", "templateId" FROM "HeroAuctionListing";
DROP TABLE "HeroAuctionListing";
ALTER TABLE "new_HeroAuctionListing" RENAME TO "HeroAuctionListing";
CREATE UNIQUE INDEX "HeroAuctionListing_heroId_key" ON "HeroAuctionListing"("heroId");
CREATE TABLE "new_ItemSetBonus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setId" INTEGER NOT NULL,
    "requiredCount" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" REAL NOT NULL,
    CONSTRAINT "ItemSetBonus_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ItemSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ItemSetBonus" ("id", "requiredCount", "setId") SELECT "id", "requiredCount", "setId" FROM "ItemSetBonus";
DROP TABLE "ItemSetBonus";
ALTER TABLE "new_ItemSetBonus" RENAME TO "ItemSetBonus";
CREATE TABLE "new_BehaviourTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'behaviors/misc.json'
);
INSERT INTO "new_BehaviourTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "BehaviourTemplate";
DROP TABLE "BehaviourTemplate";
ALTER TABLE "new_BehaviourTemplate" RENAME TO "BehaviourTemplate";
CREATE TABLE "new_DialogueTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" TEXT NOT NULL
);
INSERT INTO "new_DialogueTemplate" ("id", "npcId") SELECT "id", "npcId" FROM "DialogueTemplate";
DROP TABLE "DialogueTemplate";
ALTER TABLE "new_DialogueTemplate" RENAME TO "DialogueTemplate";
CREATE TABLE "new_BuildingTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ECONOMY',
    "filePath" TEXT NOT NULL DEFAULT 'buildings/misc.json'
);
INSERT INTO "new_BuildingTemplate" ("category", "description", "filePath", "id", "name") SELECT "category", "description", "filePath", "id", "name" FROM "BuildingTemplate";
DROP TABLE "BuildingTemplate";
ALTER TABLE "new_BuildingTemplate" RENAME TO "BuildingTemplate";
CREATE TABLE "new_HallOfFame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_HallOfFame" ("id", "name") SELECT "id", "name" FROM "HallOfFame";
DROP TABLE "HallOfFame";
ALTER TABLE "new_HallOfFame" RENAME TO "HallOfFame";
CREATE TABLE "new_RecipeIngredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipeId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "RecipeTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeIngredient" ("id", "itemId", "quantity", "recipeId") SELECT "id", "itemId", "quantity", "recipeId" FROM "RecipeIngredient";
DROP TABLE "RecipeIngredient";
ALTER TABLE "new_RecipeIngredient" RENAME TO "RecipeIngredient";
CREATE TABLE "new_GuildTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "filePath" TEXT NOT NULL DEFAULT 'guilds/misc.json'
);
INSERT INTO "new_GuildTemplate" ("description", "filePath", "id", "name", "primaryColor") SELECT "description", "filePath", "id", "name", "primaryColor" FROM "GuildTemplate";
DROP TABLE "GuildTemplate";
ALTER TABLE "new_GuildTemplate" RENAME TO "GuildTemplate";
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classId" INTEGER NOT NULL DEFAULT 1001,
    "jobId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "createdAt", "exp", "id", "jobId", "level", "name", "userId") SELECT "classId", "createdAt", "exp", "id", "jobId", "level", "name", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_UserAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserAchievement" ("achievementId", "id", "isUnlocked", "userId") SELECT "achievementId", "id", "isUnlocked", "userId" FROM "UserAchievement";
DROP TABLE "UserAchievement";
ALTER TABLE "new_UserAchievement" RENAME TO "UserAchievement";
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE TABLE "new_UserQuest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserQuest" ("id", "questId", "status", "userId") SELECT "id", "questId", "status", "userId" FROM "UserQuest";
DROP TABLE "UserQuest";
ALTER TABLE "new_UserQuest" RENAME TO "UserQuest";
CREATE UNIQUE INDEX "UserQuest_userId_questId_key" ON "UserQuest"("userId", "questId");
CREATE TABLE "new_QuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "QuestObjective_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuestObjective" ("amount", "id", "questId", "targetId", "type") SELECT "amount", "id", "questId", "targetId", "type" FROM "QuestObjective";
DROP TABLE "QuestObjective";
ALTER TABLE "new_QuestObjective" RENAME TO "QuestObjective";
CREATE TABLE "new_EventSpawn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "spawnChance" REAL NOT NULL,
    CONSTRAINT "EventSpawn_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "GlobalEventTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventSpawn" ("eventId", "id", "monsterId", "spawnChance") SELECT "eventId", "id", "monsterId", "spawnChance" FROM "EventSpawn";
DROP TABLE "EventSpawn";
ALTER TABLE "new_EventSpawn" RENAME TO "EventSpawn";
CREATE TABLE "new_BuildingInstance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuildingInstance_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BuildingInstance" ("createdAt", "id", "level", "regionId", "templateId") SELECT "createdAt", "id", "level", "regionId", "templateId" FROM "BuildingInstance";
DROP TABLE "BuildingInstance";
ALTER TABLE "new_BuildingInstance" RENAME TO "BuildingInstance";
CREATE TABLE "new_Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("createdAt", "id", "message", "type", "userId") SELECT "createdAt", "id", "message", "type", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE TABLE "new_TraitTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'traits/misc.json'
);
INSERT INTO "new_TraitTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "TraitTemplate";
DROP TABLE "TraitTemplate";
ALTER TABLE "new_TraitTemplate" RENAME TO "TraitTemplate";
CREATE TABLE "new_Mail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiverId" INTEGER NOT NULL,
    "senderId" INTEGER,
    "subject" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Mail_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mail_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mail" ("createdAt", "expiresAt", "id", "receiverId", "senderId", "subject") SELECT "createdAt", "expiresAt", "id", "receiverId", "senderId", "subject" FROM "Mail";
DROP TABLE "Mail";
ALTER TABLE "new_Mail" RENAME TO "Mail";
CREATE TABLE "new_RaceBonusTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bonusData" TEXT NOT NULL
);
INSERT INTO "new_RaceBonusTemplate" ("bonusData", "id") SELECT "bonusData", "id" FROM "RaceBonusTemplate";
DROP TABLE "RaceBonusTemplate";
ALTER TABLE "new_RaceBonusTemplate" RENAME TO "RaceBonusTemplate";
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    "templateId" INTEGER NOT NULL,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("id", "name", "templateId", "vaultGold") SELECT "id", "name", "templateId", "vaultGold" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
CREATE TABLE "new_ItemSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_ItemSet" ("id", "name") SELECT "id", "name" FROM "ItemSet";
DROP TABLE "ItemSet";
ALTER TABLE "new_ItemSet" RENAME TO "ItemSet";
CREATE TABLE "new_MarketListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    CONSTRAINT "MarketListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketListing_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MarketListing" ("id", "itemInstanceId", "pricePerUnit", "sellerId", "templateId") SELECT "id", "itemInstanceId", "pricePerUnit", "sellerId", "templateId" FROM "MarketListing";
DROP TABLE "MarketListing";
ALTER TABLE "new_MarketListing" RENAME TO "MarketListing";
CREATE UNIQUE INDEX "MarketListing_itemInstanceId_key" ON "MarketListing"("itemInstanceId");
CREATE TABLE "new_RecipeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "resultItemId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'recipes/misc.json',
    CONSTRAINT "RecipeTemplate_resultItemId_fkey" FOREIGN KEY ("resultItemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecipeTemplate" ("filePath", "id", "name", "resultItemId") SELECT "filePath", "id", "name", "resultItemId" FROM "RecipeTemplate";
DROP TABLE "RecipeTemplate";
ALTER TABLE "new_RecipeTemplate" RENAME TO "RecipeTemplate";
CREATE TABLE "new_StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_StatusEffectTemplate" ("id", "name") SELECT "id", "name" FROM "StatusEffectTemplate";
DROP TABLE "StatusEffectTemplate";
ALTER TABLE "new_StatusEffectTemplate" RENAME TO "StatusEffectTemplate";
CREATE TABLE "new_UserRecipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    CONSTRAINT "UserRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "RecipeTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserRecipe" ("id", "recipeId", "userId") SELECT "id", "recipeId", "userId" FROM "UserRecipe";
DROP TABLE "UserRecipe";
ALTER TABLE "new_UserRecipe" RENAME TO "UserRecipe";
CREATE UNIQUE INDEX "UserRecipe_userId_recipeId_key" ON "UserRecipe"("userId", "recipeId");
CREATE TABLE "new_SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'skills/misc.json'
);
INSERT INTO "new_SkillTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "SkillTemplate";
DROP TABLE "SkillTemplate";
ALTER TABLE "new_SkillTemplate" RENAME TO "SkillTemplate";
CREATE TABLE "new_MailAttachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mailId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MailAttachment_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MailAttachment" ("id", "mailId", "quantity", "templateId") SELECT "id", "mailId", "quantity", "templateId" FROM "MailAttachment";
DROP TABLE "MailAttachment";
ALTER TABLE "new_MailAttachment" RENAME TO "MailAttachment";
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'quests/misc.json'
);
INSERT INTO "new_QuestTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
CREATE TABLE "new_GlobalEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'events/misc.json'
);
INSERT INTO "new_GlobalEventTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "GlobalEventTemplate";
DROP TABLE "GlobalEventTemplate";
ALTER TABLE "new_GlobalEventTemplate" RENAME TO "GlobalEventTemplate";
CREATE TABLE "new_JobTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_JobTemplate" ("id", "name") SELECT "id", "name" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
CREATE TABLE "new_Siege" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "attackerGuildId" INTEGER NOT NULL,
    "defenderGuildId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "Siege_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Siege_attackerGuildId_fkey" FOREIGN KEY ("attackerGuildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Siege_defenderGuildId_fkey" FOREIGN KEY ("defenderGuildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Siege" ("attackerGuildId", "defenderGuildId", "id", "regionId", "status") SELECT "attackerGuildId", "defenderGuildId", "id", "regionId", "status" FROM "Siege";
DROP TABLE "Siege";
ALTER TABLE "new_Siege" RENAME TO "Siege";
CREATE TABLE "new_MarketHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL
);
INSERT INTO "new_MarketHistory" ("id", "templateId") SELECT "id", "templateId" FROM "MarketHistory";
DROP TABLE "MarketHistory";
ALTER TABLE "new_MarketHistory" RENAME TO "MarketHistory";
CREATE TABLE "new_ClassTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "filePath" TEXT NOT NULL DEFAULT 'classes/misc.json'
);
INSERT INTO "new_ClassTemplate" ("filePath", "id", "name", "tier") SELECT "filePath", "id", "name", "tier" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentDurability" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("currentDurability", "id", "quantity", "templateId", "userId") SELECT "currentDurability", "id", "quantity", "templateId", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TOWN',
    "ownerGuildId" INTEGER,
    "localTaxRate" REAL NOT NULL DEFAULT 0.02,
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "backgroundPath" TEXT NOT NULL DEFAULT 'res://assets/backgrounds/default.png',
    "musicTrack" TEXT NOT NULL DEFAULT 'default_theme',
    "filePath" TEXT NOT NULL DEFAULT 'regions/misc.json',
    CONSTRAINT "RegionTemplate_ownerGuildId_fkey" FOREIGN KEY ("ownerGuildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("backgroundPath", "dangerLevel", "description", "filePath", "id", "localTaxRate", "musicTrack", "name", "ownerGuildId", "type") SELECT "backgroundPath", "dangerLevel", "description", "filePath", "id", "localTaxRate", "musicTrack", "name", "ownerGuildId", "type" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_AchievementTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'achievements/misc.json'
);
INSERT INTO "new_AchievementTemplate" ("filePath", "id", "name") SELECT "filePath", "id", "name" FROM "AchievementTemplate";
DROP TABLE "AchievementTemplate";
ALTER TABLE "new_AchievementTemplate" RENAME TO "AchievementTemplate";
CREATE TABLE "new_HeroBid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "bidderId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "HeroBid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "HeroAuctionListing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroBid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroBid" ("amount", "bidderId", "id", "listingId") SELECT "amount", "bidderId", "id", "listingId" FROM "HeroBid";
DROP TABLE "HeroBid";
ALTER TABLE "new_HeroBid" RENAME TO "HeroBid";
CREATE TABLE "new_UserQuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userQuestId" INTEGER NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "currentAmount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserQuestObjective_userQuestId_fkey" FOREIGN KEY ("userQuestId") REFERENCES "UserQuest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuestObjective_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "QuestObjective" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserQuestObjective" ("currentAmount", "id", "objectiveId", "userQuestId") SELECT "currentAmount", "id", "objectiveId", "userQuestId" FROM "UserQuestObjective";
DROP TABLE "UserQuestObjective";
ALTER TABLE "new_UserQuestObjective" RENAME TO "UserQuestObjective";
CREATE UNIQUE INDEX "UserQuestObjective_userQuestId_objectiveId_key" ON "UserQuestObjective"("userQuestId", "objectiveId");
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "baseDurability" INTEGER NOT NULL DEFAULT 100,
    "setId" INTEGER,
    "filePath" TEXT NOT NULL DEFAULT 'items/misc.json',
    CONSTRAINT "ItemTemplate_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ItemSet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("baseDurability", "category", "filePath", "id", "name", "setId") SELECT "baseDurability", "category", "filePath", "id", "name", "setId" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json',
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "filePath", "hp_base", "id") SELECT "categoryId", "damage_base", "filePath", "hp_base", "id" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
