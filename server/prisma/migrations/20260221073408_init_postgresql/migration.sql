-- CreateEnum
CREATE TYPE "ZoneColor" AS ENUM ('VERDANT', 'AZURE', 'GOLDEN', 'CRIMSON', 'OBSIDIAN', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "TraversalType" AS ENUM ('WALK', 'BOAT', 'FLY');

-- CreateEnum
CREATE TYPE "UnitRace" AS ENUM ('HUMAN', 'VAMPIRE', 'SKELETON', 'ZOMBIE', 'BEAST', 'DEMON', 'HUMANOID', 'ELEMENTAL', 'INSECTOID', 'AQUATIC', 'DRAGON', 'CONSTRUCT', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "PvpMode" AS ENUM ('SAFE', 'CONSENT', 'RESTRICTED', 'OPEN');

-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('DUEL_1V1', 'SKIRMISH_2V2', 'FREE_FOR_ALL', 'TOURNAMENT');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('QUEUED', 'MATCHING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "WinCondition" AS ENUM ('ELIMINATION', 'SCORE_LIMIT', 'TIME_LIMIT', 'SURRENDER', 'FORFEIT');

-- CreateEnum
CREATE TYPE "TournamentType" AS ENUM ('DAILY_CUP', 'WEEKLY', 'MONTHLY', 'SPECIAL_EVENT');

-- CreateEnum
CREATE TYPE "BracketType" AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('REGISTRATION', 'CHECK_IN', 'SEEDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('REGISTERED', 'CHECKED_IN', 'PLAYING', 'ELIMINATED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('COMBAT', 'COLLECTION', 'ECONOMY', 'CRAFTING', 'PVP', 'EXPLORATION', 'SOCIAL', 'SPECIAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isPvpFlagged" BOOLEAN NOT NULL DEFAULT false,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "maxEnergy" INTEGER NOT NULL DEFAULT 100,
    "lastEnergyUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxInventorySlots" INTEGER NOT NULL DEFAULT 20,
    "currentRegion" INTEGER NOT NULL DEFAULT 1,
    "tavernTimeSecondsToday" INTEGER NOT NULL DEFAULT 0,
    "lastTavernResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastQuestResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tavernEntryAt" TIMESTAMP(3),
    "isInTavern" BOOLEAN NOT NULL DEFAULT false,
    "premiumTierId" INTEGER NOT NULL DEFAULT 0,
    "guildId" INTEGER,
    "guildRole" TEXT,
    "factionId" INTEGER,
    "pvpFlagged" BOOLEAN NOT NULL DEFAULT false,
    "lastPvpAction" TIMESTAMP(3),
    "isKnockedOut" BOOLEAN NOT NULL DEFAULT false,
    "knockedOutUntil" TIMESTAMP(3),
    "recoveryUntil" TIMESTAMP(3),
    "lastVisitedCityId" INTEGER,
    "moral" INTEGER NOT NULL DEFAULT 0,
    "bindPointId" INTEGER,
    "restingXpPool" INTEGER NOT NULL DEFAULT 0,
    "infamyScore" INTEGER NOT NULL DEFAULT 0,
    "informantReputation" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "banditReputation" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "escortGridsRemaining" INTEGER NOT NULL DEFAULT 0,
    "activeEscortName" TEXT,
    "activeSpiritId" INTEGER,
    "activeSpiritExpiresAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldBossState" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "killedAt" TIMESTAMP(3),
    "killedByUserId" INTEGER,
    "killedByUserName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldBossState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiddenTreasure" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "treasureType" TEXT NOT NULL,
    "baseChance" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "lootTableId" TEXT,
    "cooldownDays" INTEGER NOT NULL DEFAULT 7,
    "lastDiscoveredAt" TIMESTAMP(3),
    "lastDiscoveredBy" INTEGER,
    "respawnAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiddenTreasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFriend" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFriend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🏆',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',

    CONSTRAINT "AchievementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "shortDesc" TEXT NOT NULL DEFAULT '',
    "iconPath" TEXT NOT NULL DEFAULT '',
    "modelPath" TEXT NOT NULL DEFAULT '',
    "modelScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "race" "UnitRace" NOT NULL DEFAULT 'BEAST',
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
    "hp_growth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "damage_growth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "defense_growth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiScript" TEXT NOT NULL DEFAULT 'SimpleAI',
    "attack_element" TEXT NOT NULL DEFAULT 'PHYSICAL',
    "threat_modifier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "preferred_target" TEXT NOT NULL DEFAULT 'RANDOM',
    "preferred_weather" TEXT,
    "active_time" TEXT,
    "defense_base" INTEGER NOT NULL DEFAULT 0,
    "speed_base" INTEGER NOT NULL DEFAULT 5,
    "range_base" INTEGER NOT NULL DEFAULT 1,
    "accuracy_base" INTEGER NOT NULL DEFAULT 100,
    "dodge_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "crit_chance" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "crit_damage" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "block_chance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "block_power_base" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "initiative_base" INTEGER NOT NULL DEFAULT 0,
    "lifesteal_base" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cooldown_reduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "move_speed" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "attack_speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "res_fire" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "res_water" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "res_earth" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "res_wind" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "res_light" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "res_dark" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "behaviorTree" TEXT NOT NULL DEFAULT 'SimpleAI',
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "MonsterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterAiConfig" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "MonsterAiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterTrait" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,

    CONSTRAINT "MonsterTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MonsterCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterLootEntry" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "chance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MonsterLootEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "baseValue" INTEGER NOT NULL DEFAULT 10,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "isTwoHanded" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "isQuestItem" BOOLEAN NOT NULL DEFAULT false,
    "hardness" INTEGER NOT NULL DEFAULT 1,
    "minStr" INTEGER NOT NULL DEFAULT 0,
    "minToolTier" INTEGER NOT NULL DEFAULT 0,
    "toolTier" INTEGER NOT NULL DEFAULT 0,
    "elementalAffinity" INTEGER NOT NULL DEFAULT 0,
    "masteryClassId" INTEGER,
    "masteryXpAmount" INTEGER,
    "weaponTypeId" INTEGER,

    CONSTRAINT "ItemTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaponType" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "WeaponType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassiveTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PassiveTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaponTypePassive" (
    "id" SERIAL NOT NULL,
    "weaponTypeId" INTEGER NOT NULL,
    "passiveId" INTEGER NOT NULL,

    CONSTRAINT "WeaponTypePassive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroPassive" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "passiveId" INTEGER NOT NULL,

    CONSTRAINT "HeroPassive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterPassive" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "passiveId" INTEGER NOT NULL,

    CONSTRAINT "MonsterPassive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaponTypeTag" (
    "id" SERIAL NOT NULL,
    "weaponTypeId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "WeaponTypeTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InnGuestbook" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InnGuestbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterSpotting" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "discoveredByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonsterSpotting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterStudyBuff" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "race" "UnitRace" NOT NULL DEFAULT 'HUMAN',
    "atkBonus" DOUBLE PRECISION NOT NULL DEFAULT 1.05,
    "accBonus" DOUBLE PRECISION NOT NULL DEFAULT 1.05,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonsterStudyBuff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InnBardEvent" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "hiredByUserId" INTEGER NOT NULL,
    "hiredByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InnBardEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerBounty" (
    "id" SERIAL NOT NULL,
    "targetUserId" INTEGER NOT NULL,
    "issuerUserId" INTEGER NOT NULL,
    "rewardAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerBounty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalVault" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "RegionalVault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultItem" (
    "id" SERIAL NOT NULL,
    "vaultId" INTEGER NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,

    CONSTRAINT "VaultItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamblingLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "betAmount" INTEGER NOT NULL,
    "guess" INTEGER NOT NULL,
    "result" INTEGER NOT NULL,
    "isWin" BOOLEAN NOT NULL,
    "payout" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamblingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TavernRumor" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 100,
    "reliabilityAt" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TavernRumor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TavernRumorPurchase" (
    "id" SERIAL NOT NULL,
    "rumorId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "rating" INTEGER,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TavernRumorPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TavernEvent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "regionId" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "buffMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TavernEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalDailyTask" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "requiredCount" INTEGER NOT NULL,
    "silverReward" INTEGER NOT NULL DEFAULT 500,
    "repReward" INTEGER NOT NULL DEFAULT 10,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionalDailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerDailyTaskProgress" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACCEPTED',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerDailyTaskProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionArea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "RegionArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HazardType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "HazardType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionHazard" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "hazardTypeId" INTEGER NOT NULL,
    "damage" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "frequencySec" DOUBLE PRECISION NOT NULL DEFAULT 5.0,

    CONSTRAINT "RegionHazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionTemplate" (
    "id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visualType" TEXT NOT NULL DEFAULT 'TOWN',
    "traversalType" "TraversalType" NOT NULL DEFAULT 'WALK',
    "zoneType" TEXT NOT NULL DEFAULT 'GREEN',
    "zoneLevel" INTEGER NOT NULL DEFAULT 1,
    "zoneColor" "ZoneColor",
    "isSafeZone" BOOLEAN NOT NULL DEFAULT true,
    "regionalTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "weatherOverride" TEXT,
    "specialization" TEXT,
    "pvpMode" "PvpMode" NOT NULL DEFAULT 'SAFE',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "hasInn" BOOLEAN NOT NULL DEFAULT false,
    "innTier" INTEGER NOT NULL DEFAULT 1,
    "regionCategory" TEXT,
    "isBanditHideout" BOOLEAN NOT NULL DEFAULT false,
    "monsterMigrationStatus" BOOLEAN NOT NULL DEFAULT false,
    "rareHerbSpawnChance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "mysticFogIntensity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "manaStaticIntensity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "ecologicalStress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "areaId" INTEGER,
    "isDiscoveryPoint" BOOLEAN NOT NULL DEFAULT true,
    "resourceModifier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "teleportCostMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxPartyUnits" INTEGER NOT NULL DEFAULT 100,
    "minimapIcon" TEXT,
    "ambientSfxPack" TEXT,
    "particleEffectPack" TEXT,
    "skyboxOverride" TEXT,
    "fogDensity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "gatheringStaminaCost" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "mapMusicId" INTEGER,
    "regionLoreSnippet" TEXT,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "respawnPenaltyMult" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "landmarkName" TEXT,
    "flavorText" TEXT,
    "discoveryXp" INTEGER NOT NULL DEFAULT 100,
    "spawnRateMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "eliteSpawnChance" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "minRequiredUnits" INTEGER NOT NULL DEFAULT 0,
    "minRequiredHeroLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredAchievementId" INTEGER,
    "reputationRequirement" INTEGER NOT NULL DEFAULT 0,
    "factionTributeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "elementalAffinity" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "terrainAttackMod" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "terrainDefenseMod" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "innRecoveryRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "resourceScarcity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "marketDemandIndex" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "blessingType" TEXT,
    "sanctuaryPower" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "plotAvailability" INTEGER NOT NULL DEFAULT 0,
    "rentCostMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "guildBonusType" TEXT,
    "prestigePoints" INTEGER NOT NULL DEFAULT 0,
    "corruptionLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "dominanCaste" "UnitRace" NOT NULL DEFAULT 'NEUTRAL',
    "regionTypeId" TEXT,
    "factionId" INTEGER,
    "guildOwnershipId" INTEGER,
    "gridX" INTEGER NOT NULL DEFAULT 0,
    "gridY" INTEGER NOT NULL DEFAULT 0,
    "banditThreatLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "spiritDensity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "RegionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioTrack" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'BGM',
    "loops" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldEventTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "combatAtkMult" DOUBLE PRECISION,
    "combatDefMult" DOUBLE PRECISION,
    "miningYieldMult" DOUBLE PRECISION,
    "lumberingYieldMult" DOUBLE PRECISION,
    "herbalismYieldMult" DOUBLE PRECISION,
    "fishingYieldMult" DOUBLE PRECISION,
    "expGainMult" DOUBLE PRECISION,
    "lootChanceMult" DOUBLE PRECISION,
    "statIntBonus" INTEGER,
    "dangerLevelBonus" INTEGER,

    CONSTRAINT "WorldEventTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventResource" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "spawnChance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "gatherTime" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "EventResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMonster" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "spawnChance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "EventMonster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveEvent" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionNPC" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "npcId" INTEGER NOT NULL,
    "spawnChance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RegionNPC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPCTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isWanderer" BOOLEAN NOT NULL DEFAULT false,
    "healCost" INTEGER,
    "betMultiplier" DOUBLE PRECISION,
    "betWinChance" DOUBLE PRECISION,
    "travelCost" INTEGER,
    "factionId" INTEGER,
    "active_time" TEXT,

    CONSTRAINT "NPCTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopStock" (
    "id" SERIAL NOT NULL,
    "npcId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "maxQuantity" INTEGER NOT NULL DEFAULT 50,
    "nextRestock" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPCSchedule" (
    "id" SERIAL NOT NULL,
    "npcId" INTEGER NOT NULL,
    "hourStart" INTEGER NOT NULL,
    "hourEnd" INTEGER NOT NULL,
    "targetRegionId" INTEGER NOT NULL,

    CONSTRAINT "NPCSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPCEventReaction" (
    "id" SERIAL NOT NULL,
    "npcId" INTEGER NOT NULL,
    "eventTemplateId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetRegionId" INTEGER,
    "overrideDialogueId" INTEGER,

    CONSTRAINT "NPCEventReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPCTeleportRoute" (
    "id" SERIAL NOT NULL,
    "npcId" INTEGER NOT NULL,
    "targetRegionId" INTEGER NOT NULL,

    CONSTRAINT "NPCTeleportRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPCShopItem" (
    "id" SERIAL NOT NULL,
    "npcId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "priceGold" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT -1,

    CONSTRAINT "NPCShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionMonster" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,

    CONSTRAINT "RegionMonster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "RegionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerrainEffect" (
    "id" SERIAL NOT NULL,
    "regionTypeId" TEXT NOT NULL,
    "effectType" TEXT NOT NULL,
    "chance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "power" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statKey" TEXT,
    "statValue" DOUBLE PRECISION,
    "tickInterval" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TerrainEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TavernMercenary" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "recruitmentCost" INTEGER NOT NULL DEFAULT 100,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TavernMercenary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionConnection" (
    "id" SERIAL NOT NULL,
    "originRegionId" INTEGER NOT NULL,
    "targetRegionId" INTEGER NOT NULL,
    "travelTimeSeconds" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "RegionConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionResource" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "gatherTimeSeconds" INTEGER NOT NULL DEFAULT 10,
    "active_time" TEXT,

    CONSTRAINT "RegionResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTrait" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,

    CONSTRAINT "ItemTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',

    CONSTRAINT "TraitTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitStat" (
    "id" SERIAL NOT NULL,
    "traitId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TraitStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemEquipSlot" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "slotKey" TEXT NOT NULL,

    CONSTRAINT "ItemEquipSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemStat" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resultItemId" INTEGER NOT NULL,
    "craftTimeSeconds" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "RecipeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRecipe" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "UserRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hero" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "race" "UnitRace" NOT NULL DEFAULT 'HUMAN',
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
    "dodge_chance" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "crit_chance" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "crit_damage" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "block_chance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "parry_chance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hp_regen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mana_regen" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "accuracy_base" INTEGER NOT NULL DEFAULT 100,
    "armor_penetration" INTEGER NOT NULL DEFAULT 0,
    "skill_power_base" INTEGER NOT NULL DEFAULT 10,
    "tenacity_base" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "block_power_base" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "initiative_base" INTEGER NOT NULL DEFAULT 0,
    "lifesteal_base" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spell_vamp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cooldown_reduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "move_speed" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "attack_speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "classId" INTEGER NOT NULL,
    "jobId" INTEGER,
    "vitality" INTEGER NOT NULL DEFAULT 100,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "hasOffspring" BOOLEAN NOT NULL DEFAULT false,
    "fatherId" INTEGER,
    "motherId" INTEGER,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroOrder" (
    "id" SERIAL NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "heroId" INTEGER,
    "targetClassId" INTEGER,
    "minUnitLevel" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statKey" TEXT,
    "statValue" DOUBLE PRECISION,
    "power" DOUBLE PRECISION,
    "duration" INTEGER,
    "multiplier" DOUBLE PRECISION,
    "manaCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSkillTree" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ClassSkillTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSkill" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HeroSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroClassMastery" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "isMastered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HeroClassMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroBuff" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "itemId" INTEGER,
    "name" TEXT NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" DOUBLE PRECISION NOT NULL,
    "isPercent" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroBuff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "resourceType" TEXT NOT NULL DEFAULT 'MANA',
    "focus" TEXT NOT NULL DEFAULT 'General',
    "identity" TEXT NOT NULL DEFAULT 'A versatile starting point.',
    "description" TEXT NOT NULL DEFAULT '',
    "growthDesc" TEXT NOT NULL DEFAULT 'Balanced growth across all stats.',
    "mechanicDesc" TEXT NOT NULL DEFAULT 'Uses standard Mana.',
    "hpGrowth" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "mpGrowth" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "atkGrowth" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "defGrowth" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "spdGrowth" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "promotionReqLevel" INTEGER NOT NULL DEFAULT 20,
    "parentClassId" INTEGER,

    CONSTRAINT "ClassTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COLLECTION',

    CONSTRAINT "JobTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskQueue" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "heroId" INTEGER,
    "type" TEXT NOT NULL,
    "targetItemId" INTEGER,
    "originRegionId" INTEGER,
    "targetRegionId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishesAt" TIMESTAMP(3),
    "affixMaterialId" INTEGER,

    CONSTRAINT "TaskQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormationPreset" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FormationPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormationSlot" (
    "id" SERIAL NOT NULL,
    "presetId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "gridX" INTEGER NOT NULL,
    "gridY" INTEGER NOT NULL,

    CONSTRAINT "FormationSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroEquipment" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "slotKey" TEXT NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,

    CONSTRAINT "HeroEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentDurability" INTEGER NOT NULL DEFAULT 100,
    "maxDurability" INTEGER NOT NULL DEFAULT 100,
    "isTrash" BOOLEAN NOT NULL DEFAULT false,
    "isCursed" BOOLEAN NOT NULL DEFAULT false,
    "quality" TEXT NOT NULL DEFAULT 'COMMON',
    "powerScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isSoulbound" BOOLEAN NOT NULL DEFAULT false,
    "isStolen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemInstanceTrait" (
    "id" SERIAL NOT NULL,
    "itemInstanceId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,

    CONSTRAINT "ItemInstanceTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketOrder" (
    "id" SERIAL NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "initialQuantity" INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL,
    "itemInstanceId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestTemplate" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'MAIN',
    "minReputation" INTEGER NOT NULL DEFAULT 0,
    "factionId" INTEGER,
    "questGiverId" INTEGER,
    "turnInNpcId" INTEGER,
    "isDynamic" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "QuestTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestStage" (
    "id" SERIAL NOT NULL,
    "questId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "QuestStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestObjective" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,

    CONSTRAINT "QuestObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestReward" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" INTEGER,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "factionId" INTEGER,

    CONSTRAINT "QuestReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "currentStageId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "UserQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestProgress" (
    "id" SERIAL NOT NULL,
    "userQuestId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "UserQuestProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mail" (
    "id" SERIAL NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroTrait" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,

    CONSTRAINT "HeroTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#f59e0b',
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    "treasury" INTEGER NOT NULL DEFAULT 0,
    "marketTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "gatheringTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "factionId" INTEGER,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildHistoryMetadata" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "GuildHistoryMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildInvite" (
    "id" SERIAL NOT NULL,
    "guildId" INTEGER NOT NULL,
    "invitedUserId" INTEGER,
    "invitedBy" INTEGER NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildHistory" (
    "id" SERIAL NOT NULL,
    "guildId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" INTEGER,
    "targetUserId" INTEGER,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactionRelation" (
    "id" SERIAL NOT NULL,
    "factionAId" INTEGER NOT NULL,
    "factionBId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEUTRAL',

    CONSTRAINT "FactionRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Territory" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "guildId" INTEGER NOT NULL,
    "fortification" INTEGER NOT NULL DEFAULT 1000,
    "maxFortification" INTEGER NOT NULL DEFAULT 1000,
    "siegeStatus" TEXT NOT NULL DEFAULT 'PEACE',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpkeepAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthlyQuestProgress" INTEGER NOT NULL DEFAULT 0,
    "monthlyQuestQuota" INTEGER NOT NULL DEFAULT 10,
    "maintenanceCost" INTEGER NOT NULL DEFAULT 1000,
    "taxDistributionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "nextMaintenanceAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "baseTreasury" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuildTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildCreationReqData" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "GuildCreationReqData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildFacilityTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statKey" TEXT,
    "statValuePerLevel" DOUBLE PRECISION,
    "costBase" INTEGER NOT NULL DEFAULT 1000,
    "costMult" DOUBLE PRECISION NOT NULL DEFAULT 1.5,

    CONSTRAINT "GuildFacilityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildFacility" (
    "id" SERIAL NOT NULL,
    "guildId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "GuildFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildPerk" (
    "id" SERIAL NOT NULL,
    "guildId" INTEGER NOT NULL,
    "perkKey" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "GuildPerk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siege" (
    "id" SERIAL NOT NULL,
    "territoryId" INTEGER NOT NULL,
    "attackerGuildId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Siege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiegeLog" (
    "id" SERIAL NOT NULL,
    "siegeId" INTEGER NOT NULL,
    "event" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiegeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionLedger" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "currencyTier" TEXT NOT NULL,
    "silverDelta" BIGINT NOT NULL DEFAULT 0,
    "silverBalance" BIGINT NOT NULL DEFAULT 0,
    "sourceId" INTEGER,
    "sourceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumTierTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "queueSlots" INTEGER NOT NULL DEFAULT 0,
    "speedBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "energyRegenMult" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxEnergyBonus" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PremiumTierTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#64748b',

    CONSTRAINT "Faction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalInfluence" (
    "id" SERIAL NOT NULL,
    "factionId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionalInfluence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactionRank" (
    "id" SERIAL NOT NULL,
    "factionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "minReputation" INTEGER NOT NULL DEFAULT 0,
    "statKey" TEXT,
    "statValue" DOUBLE PRECISION,
    "expBonus" DOUBLE PRECISION,

    CONSTRAINT "FactionRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSaleHistory" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "unitLevel" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroSaleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemSaleHistory" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER,
    "templateId" INTEGER NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemSaleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReputation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "factionId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserReputation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueNode" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "npcId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isRoot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DialogueNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueChoice" (
    "id" SERIAL NOT NULL,
    "nodeId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "nextNodeId" INTEGER,
    "questId" INTEGER,
    "reputationAmount" INTEGER,
    "reputationFactionId" INTEGER,
    "triggerCombat" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DialogueChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wagon" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'LOADING',
    "originRegionId" INTEGER,
    "targetRegionId" INTEGER,
    "selectedPath" TEXT,
    "currentPathIndex" INTEGER NOT NULL DEFAULT 0,
    "elapsedTimeInCurrentMap" INTEGER NOT NULL DEFAULT 0,
    "nextAmbushCheckAt" TIMESTAMP(3),
    "feePaid" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wagon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WagonItem" (
    "id" SERIAL NOT NULL,
    "wagonId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "WagonItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LootSession" (
    "id" SERIAL NOT NULL,
    "looterId" INTEGER NOT NULL,
    "victimId" INTEGER NOT NULL,
    "wagonId" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LootSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalExtractionStats" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "volume24h" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionalExtractionStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bounty" (
    "id" SERIAL NOT NULL,
    "targetId" INTEGER NOT NULL,
    "hunterId" INTEGER,
    "rewardSilver" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "regionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldState" (
    "id" SERIAL NOT NULL,
    "currentHour" INTEGER NOT NULL DEFAULT 12,
    "weatherType" TEXT NOT NULL DEFAULT 'CLEAR',
    "moonPhase" TEXT NOT NULL DEFAULT 'NEW',
    "lastTick" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorldState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "channelType" TEXT NOT NULL DEFAULT 'GLOBAL',
    "channelId" INTEGER,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroElementalAffinity" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "elementType" TEXT NOT NULL,
    "resistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusDamage" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HeroElementalAffinity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentSetTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "EquipmentSetTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentSetPiece" (
    "id" SERIAL NOT NULL,
    "setId" INTEGER NOT NULL,
    "pieceOrder" INTEGER NOT NULL,
    "itemTemplateId" INTEGER NOT NULL,

    CONSTRAINT "EquipmentSetPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentSetBonus" (
    "id" SERIAL NOT NULL,
    "setId" INTEGER NOT NULL,
    "requiredPieces" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "bonusValue" INTEGER NOT NULL,

    CONSTRAINT "EquipmentSetBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentSetBonusStat" (
    "id" SERIAL NOT NULL,
    "bonusId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "EquipmentSetBonusStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetBonusCondition" (
    "id" SERIAL NOT NULL,
    "bonusId" INTEGER NOT NULL,
    "conditionType" TEXT NOT NULL,
    "conditionValue" TEXT NOT NULL,

    CONSTRAINT "SetBonusCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroEquipmentSet" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "setId" INTEGER NOT NULL,
    "equippedPieces" INTEGER NOT NULL DEFAULT 0,
    "activeBonusId" INTEGER,

    CONSTRAINT "HeroEquipmentSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatAllocationTemplate" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "strGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "dexGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "intGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "vitGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "defGrowthCurve" TEXT NOT NULL DEFAULT 'linear',
    "strGrowthFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "dexGrowthFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "intGrowthFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "vitGrowthFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "defGrowthFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "basePointsPerLevel" INTEGER NOT NULL DEFAULT 5,
    "maxStatCap" INTEGER NOT NULL DEFAULT 255,
    "recommendedStr" INTEGER NOT NULL DEFAULT 10,
    "recommendedDex" INTEGER NOT NULL DEFAULT 10,
    "recommendedInt" INTEGER NOT NULL DEFAULT 10,
    "recommendedDef" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "StatAllocationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroStatHistory" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" INTEGER NOT NULL,

    CONSTRAINT "HeroStatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroHistoryPrimaryStat" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "HeroHistoryPrimaryStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroHistorySecondaryStat" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "HeroHistorySecondaryStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroHistoryEquippedItem" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "HeroHistoryEquippedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroHistoryActiveBuff" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "buffId" TEXT NOT NULL,

    CONSTRAINT "HeroHistoryActiveBuff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroStatAudit" (
    "id" SERIAL NOT NULL,
    "heroId" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeType" TEXT NOT NULL,
    "statName" TEXT,
    "previousValue" DOUBLE PRECISION,
    "newValue" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "HeroStatAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "StatusEffectTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "StatusEffectTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MechanicTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "MechanicTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReactionTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "cooldown" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReactionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuraTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "radius" INTEGER NOT NULL DEFAULT 1,
    "effect" TEXT NOT NULL,
    "vfxPath" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "AuraTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummonTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "spawnUnitId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "statScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "SummonTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrageCondition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "EnrageCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhaseTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "PhaseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterTag" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "MonsterTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterSkill" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "usageChance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "cooldown" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MonsterSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterReaction" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "reactionId" INTEGER NOT NULL,
    "chance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MonsterReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterAura" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "auraId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MonsterAura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterSummon" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "summonId" INTEGER NOT NULL,
    "chance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxActive" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MonsterSummon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterImmunity" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "statusEffectId" INTEGER NOT NULL,

    CONSTRAINT "MonsterImmunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterVulnerability" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "statusEffectId" INTEGER NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,

    CONSTRAINT "MonsterVulnerability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterEnrage" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "enrageId" INTEGER NOT NULL,
    "stat_hp_bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stat_dmg_bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unlockSkillId" INTEGER,

    CONSTRAINT "MonsterEnrage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterCompanion" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "companionId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "spawnDelay" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MonsterCompanion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterPhase" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "phaseOrder" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MonsterPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterFormation" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "preferredRow" INTEGER NOT NULL DEFAULT 1,
    "preferredColumn" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "MonsterFormation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterTerritoryBonus" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "regionTypeId" TEXT NOT NULL,
    "stat_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "immune_effect" TEXT,
    "bonus_effect" TEXT,

    CONSTRAINT "MonsterTerritoryBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceInfo" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL DEFAULT 'DESKTOP',
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "token" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "username" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyInstance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "propertyName" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "bulletinMessage" TEXT,
    "lastRentPaid" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyGuest" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "guestUserId" INTEGER NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT 'REST_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalRecoveryStash" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "recoveryFee" INTEGER NOT NULL DEFAULT 0,
    "confiscatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionalRecoveryStash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpiritTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lore" TEXT NOT NULL,
    "effectType" TEXT NOT NULL DEFAULT 'BUFF',
    "statKey" TEXT NOT NULL DEFAULT 'accuracy',
    "statValue" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isBenevolent" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SpiritTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionSpirit" (
    "regionId" INTEGER NOT NULL,
    "spiritId" INTEGER NOT NULL,

    CONSTRAINT "RegionSpirit_pkey" PRIMARY KEY ("regionId","spiritId")
);

-- CreateTable
CREATE TABLE "UserAttribute" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" DOUBLE PRECISION,
    "valBool" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterBehaviorParam" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" DOUBLE PRECISION,
    "valBool" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonsterBehaviorParam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestVariable" (
    "id" SERIAL NOT NULL,
    "userQuestId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" DOUBLE PRECISION,
    "valBool" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildHistoryMeta" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" DOUBLE PRECISION,
    "valBool" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildHistoryMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildCreationRequirement" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "valStr" TEXT,
    "valInt" INTEGER,
    "valFloat" DOUBLE PRECISION,
    "valBool" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildCreationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroHistoryStat" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'PRIMARY',
    "statKey" TEXT NOT NULL,
    "statValue" DOUBLE PRECISION NOT NULL,
    "auditTrail" TEXT,

    CONSTRAINT "HeroHistoryStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroHistoryEquipment" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "slotKey" TEXT NOT NULL,
    "itemTemplateId" INTEGER,
    "itemInstanceId" INTEGER,

    CONSTRAINT "HeroHistoryEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroHistoryBuff" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "traitTemplateId" INTEGER NOT NULL,

    CONSTRAINT "HeroHistoryBuff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateIsland" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "plotCount" INTEGER NOT NULL DEFAULT 10,
    "storageSlotCount" INTEGER NOT NULL DEFAULT 10,
    "maxPlots" INTEGER NOT NULL DEFAULT 50,
    "maxStorageSlots" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateIsland_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenPlot" (
    "id" SERIAL NOT NULL,
    "islandId" INTEGER NOT NULL,
    "plotIndex" INTEGER NOT NULL,
    "cropTemplateId" INTEGER,
    "seedItemId" INTEGER,
    "plantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "harvestAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'EMPTY',
    "growthProgress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "yieldMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "GardenPlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IslandStorageItem" (
    "id" SERIAL NOT NULL,
    "islandId" INTEGER NOT NULL,
    "itemTemplateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "slotIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IslandStorageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropTemplate" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "CropTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerReputation" (
    "id" SERIAL NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "comment" TEXT,
    "interactionType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerReputation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerReputationStats" (
    "userId" INTEGER NOT NULL,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalDislikes" INTEGER NOT NULL DEFAULT 0,
    "likeTier" INTEGER NOT NULL DEFAULT 0,
    "dislikeTier" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerReputationStats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "SkillMastery" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'NOVICE',
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillMasteryReward" (
    "id" SERIAL NOT NULL,
    "level" TEXT NOT NULL,
    "usesRequired" INTEGER NOT NULL,
    "skillDamageBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "effectDurationBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "critChanceBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costReduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SkillMasteryReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroBond" (
    "id" SERIAL NOT NULL,
    "bondType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "bonuses" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HeroBond_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHeroBond" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bondId" INTEGER NOT NULL,
    "heroIds" TEXT NOT NULL,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHeroBond_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemEnchantment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValuePerLevel" DOUBLE PRECISION NOT NULL,
    "percentBonusPerLevel" DOUBLE PRECISION NOT NULL,
    "isPercent" BOOLEAN NOT NULL DEFAULT false,
    "condition" TEXT,
    "materialId" INTEGER,
    "materialCount" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 10,
    "baseSuccessRate" DOUBLE PRECISION NOT NULL DEFAULT 0.8,

    CONSTRAINT "ItemEnchantment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItemEnchantment" (
    "id" SERIAL NOT NULL,
    "inventoryItemId" INTEGER NOT NULL,
    "enchantmentId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItemEnchantment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GemTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" DOUBLE PRECISION NOT NULL,
    "percentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dropChance" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "bossDropChance" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "baseValue" INTEGER NOT NULL DEFAULT 100,
    "nextTierGemId" INTEGER,

    CONSTRAINT "GemTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItemSocket" (
    "id" SERIAL NOT NULL,
    "inventoryItemId" INTEGER NOT NULL,
    "gemId" INTEGER,
    "insertedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryItemSocket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftingSkill" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "profession" TEXT NOT NULL,
    "rank" TEXT NOT NULL DEFAULT 'NOVICE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "totalCrafts" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CraftingSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftingLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "profession" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "itemRarity" TEXT NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "rolled" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CraftingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonModifier" (
    "id" SERIAL NOT NULL,
    "modifierKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '⚡',
    "color" TEXT NOT NULL DEFAULT '#ff0000',

    CONSTRAINT "DungeonModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonModifierStatMult" (
    "id" SERIAL NOT NULL,
    "modifierId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "DungeonModifierStatMult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonModifierStatusEffect" (
    "id" SERIAL NOT NULL,
    "modifierId" INTEGER NOT NULL,
    "effectId" TEXT NOT NULL,

    CONSTRAINT "DungeonModifierStatusEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonTemplate" (
    "id" SERIAL NOT NULL,
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
    "resetType" TEXT NOT NULL DEFAULT 'DAILY',

    CONSTRAINT "DungeonTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonFloor" (
    "id" SERIAL NOT NULL,
    "dungeonId" INTEGER NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gridWidth" INTEGER NOT NULL DEFAULT 8,
    "gridHeight" INTEGER NOT NULL DEFAULT 8,
    "tileMapPath" TEXT,
    "eliteSpawnRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "bossSpawnRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "monsterLevelScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "goldRewardScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "xpRewardScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "lootBonusScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "killCountRequired" INTEGER NOT NULL DEFAULT 10,
    "bossRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DungeonFloor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonFloorMonsterPool" (
    "id" SERIAL NOT NULL,
    "floorId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,

    CONSTRAINT "DungeonFloorMonsterPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonFloorModifier" (
    "id" SERIAL NOT NULL,
    "floorId" INTEGER NOT NULL,
    "modifierId" INTEGER NOT NULL,
    "stackCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "DungeonFloorModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonEntry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dungeonId" INTEGER NOT NULL,
    "currentFloor" INTEGER NOT NULL DEFAULT 1,
    "highestFloor" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "firstEnteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEnteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalGoldEarned" INTEGER NOT NULL DEFAULT 0,
    "totalXpEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DungeonEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonEntryFloorProgress" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "floorId" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "bossesKilled" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DungeonEntryFloorProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonEntryRewardClaim" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "rewardId" TEXT NOT NULL,

    CONSTRAINT "DungeonEntryRewardClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasureMap" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "inventoryItemId" INTEGER,
    "rarity" TEXT NOT NULL,
    "regionId" INTEGER,
    "regionName" TEXT,
    "coordinatesX" INTEGER,
    "coordinatesY" INTEGER,
    "hints" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "coordOffsetX" INTEGER NOT NULL DEFAULT 0,
    "coordOffsetY" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreasureMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreasureLootTable" (
    "id" SERIAL NOT NULL,
    "rarity" TEXT NOT NULL,
    "lootType" TEXT NOT NULL,
    "goldMin" INTEGER,
    "goldMax" INTEGER,
    "goldWeight" INTEGER,
    "itemTemplateId" INTEGER,
    "quantityMin" INTEGER,
    "quantityMax" INTEGER,
    "itemWeight" INTEGER,
    "dropChance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isEpicItem" BOOLEAN NOT NULL DEFAULT false,
    "isLegendaryItem" BOOLEAN NOT NULL DEFAULT false,
    "itemRarity" TEXT,

    CONSTRAINT "TreasureLootTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaMatch" (
    "id" TEXT NOT NULL,
    "matchCode" TEXT NOT NULL,
    "gameMode" "GameMode" NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'QUEUED',
    "winnerId" TEXT,
    "winCondition" "WinCondition",
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "seasonId" TEXT,
    "isRanked" BOOLEAN NOT NULL DEFAULT true,
    "battleId" TEXT,

    CONSTRAINT "ArenaMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaMatchParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "ratingBefore" INTEGER,
    "ratingAfter" INTEGER,
    "ratingDelta" INTEGER,

    CONSTRAINT "ArenaMatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaRating" (
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "soloRating" INTEGER NOT NULL DEFAULT 1000,
    "soloWins" INTEGER NOT NULL DEFAULT 0,
    "soloLosses" INTEGER NOT NULL DEFAULT 0,
    "soloStreak" INTEGER NOT NULL DEFAULT 0,
    "teamRating" INTEGER NOT NULL DEFAULT 1000,
    "teamWins" INTEGER NOT NULL DEFAULT 0,
    "teamLosses" INTEGER NOT NULL DEFAULT 0,
    "ffaPoints" INTEGER NOT NULL DEFAULT 0,
    "ffaWins" INTEGER NOT NULL DEFAULT 0,
    "ffaPlays" INTEGER NOT NULL DEFAULT 0,
    "currentRank" TEXT NOT NULL DEFAULT 'Bronze V',
    "highestRank" TEXT NOT NULL DEFAULT 'Bronze V',
    "division" INTEGER NOT NULL DEFAULT 5,
    "seasonWins" INTEGER NOT NULL DEFAULT 0,
    "seasonMatches" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaRating_pkey" PRIMARY KEY ("playerId")
);

-- CreateTable
CREATE TABLE "ArenaSeason" (
    "id" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "participation" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaSeasonTopReward" (
    "id" SERIAL NOT NULL,
    "seasonId" TEXT NOT NULL,
    "rankValue" INTEGER NOT NULL,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,

    CONSTRAINT "ArenaSeasonTopReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaLeaderboard" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "gameMode" "GameMode" NOT NULL,
    "rank" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "maxStreak" INTEGER NOT NULL DEFAULT 0,
    "spectatedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaLeaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TournamentType" NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "bracketType" "BracketType" NOT NULL,
    "registrationStart" TIMESTAMP(3) NOT NULL,
    "registrationEnd" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "entryFee" INTEGER NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 50,
    "participationReward" INTEGER NOT NULL DEFAULT 0,
    "status" "TournamentStatus" NOT NULL DEFAULT 'REGISTRATION',
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentPrize" (
    "id" SERIAL NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "rankValue" INTEGER NOT NULL,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,

    CONSTRAINT "TournamentPrize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentParticipant" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "elo" INTEGER NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'REGISTERED',
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "isEliminated" BOOLEAN NOT NULL DEFAULT false,
    "bracketPosition" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentMatch" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "bracketType" "BracketType" NOT NULL DEFAULT 'SINGLE_ELIMINATION',
    "playerAId" TEXT,
    "playerBId" TEXT,
    "winnerId" TEXT,
    "scoreA" INTEGER NOT NULL DEFAULT 0,
    "scoreB" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "arenaMatchId" TEXT,
    "nextMatchId" TEXT,
    "loserNextMatchId" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'QUEUED',

    CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentBracket" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "bracketData" TEXT NOT NULL,
    "currentRound" INTEGER NOT NULL,
    "activeMatches" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentBracket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAchievement" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "achievementCode" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "currentTier" INTEGER NOT NULL DEFAULT 0,
    "rewardsClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "isDiscovered" BOOLEAN NOT NULL DEFAULT false,
    "discoveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAchievementTier" (
    "id" SERIAL NOT NULL,
    "playerAchievId" TEXT NOT NULL,
    "tierValue" INTEGER NOT NULL,

    CONSTRAINT "PlayerAchievementTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTitle" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🎖️',
    "badgeColor" TEXT NOT NULL DEFAULT '#ffffff',
    "source" TEXT NOT NULL,
    "sourceCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key_key" ON "UserSetting"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "WorldBossState_monsterId_key" ON "WorldBossState"("monsterId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFriend_userId_friendId_key" ON "UserFriend"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterAiConfig_monsterId_key_key" ON "MonsterAiConfig"("monsterId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "WeaponType_name_key" ON "WeaponType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WeaponTypePassive_weaponTypeId_passiveId_key" ON "WeaponTypePassive"("weaponTypeId", "passiveId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroPassive_heroId_passiveId_key" ON "HeroPassive"("heroId", "passiveId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterPassive_monsterId_passiveId_key" ON "MonsterPassive"("monsterId", "passiveId");

-- CreateIndex
CREATE UNIQUE INDEX "WeaponTypeTag_weaponTypeId_tagId_key" ON "WeaponTypeTag"("weaponTypeId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalVault_userId_regionId_key" ON "RegionalVault"("userId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "VaultItem_itemInstanceId_key" ON "VaultItem"("itemInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "RegionArea_name_key" ON "RegionArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HazardType_name_key" ON "HazardType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AudioTrack_name_path_key" ON "AudioTrack"("name", "path");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveEvent_regionId_templateId_key" ON "ActiveEvent"("regionId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "RegionNPC_regionId_npcId_key" ON "RegionNPC"("regionId", "npcId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopStock_npcId_regionId_templateId_key" ON "ShopStock"("npcId", "regionId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "NPCTeleportRoute_npcId_targetRegionId_key" ON "NPCTeleportRoute"("npcId", "targetRegionId");

-- CreateIndex
CREATE INDEX "RegionMonster_regionId_idx" ON "RegionMonster"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "TavernMercenary_heroId_key" ON "TavernMercenary"("heroId");

-- CreateIndex
CREATE INDEX "TavernMercenary_regionId_expiresAt_idx" ON "TavernMercenary"("regionId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegionConnection_originRegionId_targetRegionId_key" ON "RegionConnection"("originRegionId", "targetRegionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRecipe_userId_recipeId_key" ON "UserRecipe"("userId", "recipeId");

-- CreateIndex
CREATE INDEX "Hero_userId_idx" ON "Hero"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroOrder_heroId_key" ON "HeroOrder"("heroId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSkillTree_classId_skillId_key" ON "ClassSkillTree"("classId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroSkill_heroId_skillId_key" ON "HeroSkill"("heroId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroClassMastery_heroId_classId_key" ON "HeroClassMastery"("heroId", "classId");

-- CreateIndex
CREATE INDEX "TaskQueue_userId_status_idx" ON "TaskQueue"("userId", "status");

-- CreateIndex
CREATE INDEX "TaskQueue_heroId_idx" ON "TaskQueue"("heroId");

-- CreateIndex
CREATE UNIQUE INDEX "FormationSlot_presetId_gridX_gridY_key" ON "FormationSlot"("presetId", "gridX", "gridY");

-- CreateIndex
CREATE UNIQUE INDEX "FormationSlot_presetId_heroId_key" ON "FormationSlot"("presetId", "heroId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroEquipment_itemInstanceId_key" ON "HeroEquipment"("itemInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroEquipment_heroId_slotKey_key" ON "HeroEquipment"("heroId", "slotKey");

-- CreateIndex
CREATE INDEX "InventoryItem_userId_idx" ON "InventoryItem"("userId");

-- CreateIndex
CREATE INDEX "InventoryItem_userId_templateId_idx" ON "InventoryItem"("userId", "templateId");

-- CreateIndex
CREATE INDEX "MarketOrder_templateId_status_idx" ON "MarketOrder"("templateId", "status");

-- CreateIndex
CREATE INDEX "MarketOrder_expiresAt_idx" ON "MarketOrder"("expiresAt");

-- CreateIndex
CREATE INDEX "MarketOrder_creatorId_idx" ON "MarketOrder"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestStage_questId_order_key" ON "QuestStage"("questId", "order");

-- CreateIndex
CREATE INDEX "UserQuest_userId_status_idx" ON "UserQuest"("userId", "status");

-- CreateIndex
CREATE INDEX "UserQuest_questId_idx" ON "UserQuest"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestProgress_userQuestId_key_key" ON "UserQuestProgress"("userQuestId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GuildHistoryMetadata_historyId_key_key" ON "GuildHistoryMetadata"("historyId", "key");

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
CREATE UNIQUE INDEX "FactionRelation_factionAId_factionBId_key" ON "FactionRelation"("factionAId", "factionBId");

-- CreateIndex
CREATE UNIQUE INDEX "Territory_regionId_key" ON "Territory"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildCreationReqData_templateId_key_key" ON "GuildCreationReqData"("templateId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "GuildFacility_guildId_templateId_key" ON "GuildFacility"("guildId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalInfluence_factionId_regionId_key" ON "RegionalInfluence"("factionId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "FactionRank_factionId_minReputation_key" ON "FactionRank"("factionId", "minReputation");

-- CreateIndex
CREATE UNIQUE INDEX "UserReputation_userId_factionId_key" ON "UserReputation"("userId", "factionId");

-- CreateIndex
CREATE UNIQUE INDEX "Wagon_userId_key" ON "Wagon"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalExtractionStats_regionId_templateId_key" ON "RegionalExtractionStats"("regionId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroElementalAffinity_heroId_elementType_key" ON "HeroElementalAffinity"("heroId", "elementType");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSetTemplate_name_key" ON "EquipmentSetTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSetPiece_setId_pieceOrder_key" ON "EquipmentSetPiece"("setId", "pieceOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSetBonus_setId_requiredPieces_key" ON "EquipmentSetBonus"("setId", "requiredPieces");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSetBonusStat_bonusId_key_key" ON "EquipmentSetBonusStat"("bonusId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "HeroEquipmentSet_heroId_setId_key" ON "HeroEquipmentSet"("heroId", "setId");

-- CreateIndex
CREATE UNIQUE INDEX "StatAllocationTemplate_classId_key" ON "StatAllocationTemplate"("classId");

-- CreateIndex
CREATE INDEX "HeroStatHistory_heroId_recordedAt_idx" ON "HeroStatHistory"("heroId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HeroHistoryPrimaryStat_historyId_key_key" ON "HeroHistoryPrimaryStat"("historyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "HeroHistorySecondaryStat_historyId_key_key" ON "HeroHistorySecondaryStat"("historyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "HeroHistoryEquippedItem_historyId_itemId_key" ON "HeroHistoryEquippedItem"("historyId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroHistoryActiveBuff_historyId_buffId_key" ON "HeroHistoryActiveBuff"("historyId", "buffId");

-- CreateIndex
CREATE INDEX "HeroStatAudit_heroId_recordedAt_idx" ON "HeroStatAudit"("heroId", "recordedAt");

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

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "UserSession"("token");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_token_idx" ON "UserSession"("token");

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_idx" ON "LoginAttempt"("userId");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_idx" ON "LoginAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyInstance_userId_regionId_key" ON "PropertyInstance"("userId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyGuest_propertyId_guestUserId_key" ON "PropertyGuest"("propertyId", "guestUserId");

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

-- CreateIndex
CREATE UNIQUE INDEX "PrivateIsland_userId_key" ON "PrivateIsland"("userId");

-- CreateIndex
CREATE INDEX "GardenPlot_islandId_idx" ON "GardenPlot"("islandId");

-- CreateIndex
CREATE INDEX "GardenPlot_status_idx" ON "GardenPlot"("status");

-- CreateIndex
CREATE INDEX "IslandStorageItem_islandId_idx" ON "IslandStorageItem"("islandId");

-- CreateIndex
CREATE INDEX "IslandStorageItem_slotIndex_idx" ON "IslandStorageItem"("slotIndex");

-- CreateIndex
CREATE INDEX "CropTemplate_seedItemId_idx" ON "CropTemplate"("seedItemId");

-- CreateIndex
CREATE INDEX "PlayerReputation_toUserId_idx" ON "PlayerReputation"("toUserId");

-- CreateIndex
CREATE INDEX "PlayerReputation_fromUserId_idx" ON "PlayerReputation"("fromUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerReputation_fromUserId_toUserId_key" ON "PlayerReputation"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX "SkillMastery_userId_idx" ON "SkillMastery"("userId");

-- CreateIndex
CREATE INDEX "SkillMastery_heroId_idx" ON "SkillMastery"("heroId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillMastery_heroId_skillId_key" ON "SkillMastery"("heroId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroBond_name_key" ON "HeroBond"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserHeroBond_userId_bondId_heroIds_key" ON "UserHeroBond"("userId", "bondId", "heroIds");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItemEnchantment_inventoryItemId_enchantmentId_key" ON "InventoryItemEnchantment"("inventoryItemId", "enchantmentId");

-- CreateIndex
CREATE UNIQUE INDEX "GemTemplate_nextTierGemId_key" ON "GemTemplate"("nextTierGemId");

-- CreateIndex
CREATE INDEX "GemTemplate_element_idx" ON "GemTemplate"("element");

-- CreateIndex
CREATE INDEX "GemTemplate_tier_idx" ON "GemTemplate"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "GemTemplate_element_tier_key" ON "GemTemplate"("element", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItemSocket_inventoryItemId_key" ON "InventoryItemSocket"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryItemSocket_gemId_idx" ON "InventoryItemSocket"("gemId");

-- CreateIndex
CREATE INDEX "CraftingSkill_userId_idx" ON "CraftingSkill"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CraftingSkill_userId_profession_key" ON "CraftingSkill"("userId", "profession");

-- CreateIndex
CREATE INDEX "CraftingLog_userId_idx" ON "CraftingLog"("userId");

-- CreateIndex
CREATE INDEX "CraftingLog_createdAt_idx" ON "CraftingLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonModifier_modifierKey_key" ON "DungeonModifier"("modifierKey");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonModifierStatMult_modifierId_key_key" ON "DungeonModifierStatMult"("modifierId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonModifierStatusEffect_modifierId_effectId_key" ON "DungeonModifierStatusEffect"("modifierId", "effectId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonTemplate_dungeonKey_key" ON "DungeonTemplate"("dungeonKey");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonFloor_dungeonId_floorNumber_key" ON "DungeonFloor"("dungeonId", "floorNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonFloorMonsterPool_floorId_monsterId_key" ON "DungeonFloorMonsterPool"("floorId", "monsterId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonFloorModifier_floorId_modifierId_key" ON "DungeonFloorModifier"("floorId", "modifierId");

-- CreateIndex
CREATE INDEX "DungeonEntry_userId_idx" ON "DungeonEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonEntry_userId_dungeonId_key" ON "DungeonEntry"("userId", "dungeonId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonEntryFloorProgress_entryId_floorId_key" ON "DungeonEntryFloorProgress"("entryId", "floorId");

-- CreateIndex
CREATE UNIQUE INDEX "DungeonEntryRewardClaim_entryId_rewardId_key" ON "DungeonEntryRewardClaim"("entryId", "rewardId");

-- CreateIndex
CREATE INDEX "TreasureMap_userId_idx" ON "TreasureMap"("userId");

-- CreateIndex
CREATE INDEX "TreasureMap_userId_rarity_idx" ON "TreasureMap"("userId", "rarity");

-- CreateIndex
CREATE INDEX "TreasureMap_expiresAt_idx" ON "TreasureMap"("expiresAt");

-- CreateIndex
CREATE INDEX "TreasureLootTable_rarity_idx" ON "TreasureLootTable"("rarity");

-- CreateIndex
CREATE UNIQUE INDEX "TreasureLootTable_rarity_lootType_itemTemplateId_key" ON "TreasureLootTable"("rarity", "lootType", "itemTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaMatch_matchCode_key" ON "ArenaMatch"("matchCode");

-- CreateIndex
CREATE INDEX "ArenaMatch_seasonId_gameMode_idx" ON "ArenaMatch"("seasonId", "gameMode");

-- CreateIndex
CREATE INDEX "ArenaMatch_status_idx" ON "ArenaMatch"("status");

-- CreateIndex
CREATE INDEX "ArenaMatch_winnerId_idx" ON "ArenaMatch"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaMatchParticipant_matchId_playerId_key" ON "ArenaMatchParticipant"("matchId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaRating_playerId_seasonId_key" ON "ArenaRating"("playerId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaSeason_seasonNumber_key" ON "ArenaSeason"("seasonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaSeasonTopReward_seasonId_rankValue_key" ON "ArenaSeasonTopReward"("seasonId", "rankValue");

-- CreateIndex
CREATE INDEX "ArenaLeaderboard_seasonId_gameMode_rank_idx" ON "ArenaLeaderboard"("seasonId", "gameMode", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaLeaderboard_playerId_seasonId_gameMode_key" ON "ArenaLeaderboard"("playerId", "seasonId", "gameMode");

-- CreateIndex
CREATE INDEX "Tournament_status_startDate_idx" ON "Tournament"("status", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentPrize_tournamentId_rankValue_key" ON "TournamentPrize"("tournamentId", "rankValue");

-- CreateIndex
CREATE INDEX "TournamentParticipant_tournamentId_seed_idx" ON "TournamentParticipant"("tournamentId", "seed");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentParticipant_tournamentId_playerId_key" ON "TournamentParticipant"("tournamentId", "playerId");

-- CreateIndex
CREATE INDEX "TournamentMatch_tournamentId_round_idx" ON "TournamentMatch"("tournamentId", "round");

-- CreateIndex
CREATE INDEX "TournamentMatch_status_idx" ON "TournamentMatch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentBracket_tournamentId_key" ON "TournamentBracket"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE INDEX "Achievement_category_isActive_idx" ON "Achievement"("category", "isActive");

-- CreateIndex
CREATE INDEX "Achievement_counterName_idx" ON "Achievement"("counterName");

-- CreateIndex
CREATE INDEX "PlayerAchievement_userId_idx" ON "PlayerAchievement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAchievement_userId_achievementCode_key" ON "PlayerAchievement"("userId", "achievementCode");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAchievementTier_playerAchievId_tierValue_key" ON "PlayerAchievementTier"("playerAchievId", "tierValue");

-- CreateIndex
CREATE INDEX "PlayerTitle_userId_idx" ON "PlayerTitle"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTitle_userId_title_key" ON "PlayerTitle"("userId", "title");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bindPointId_fkey" FOREIGN KEY ("bindPointId") REFERENCES "RegionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_premiumTierId_fkey" FOREIGN KEY ("premiumTierId") REFERENCES "PremiumTierTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentRegion_fkey" FOREIGN KEY ("currentRegion") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeSpiritId_fkey" FOREIGN KEY ("activeSpiritId") REFERENCES "SpiritTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldBossState" ADD CONSTRAINT "WorldBossState_killedByUserId_fkey" FOREIGN KEY ("killedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldBossState" ADD CONSTRAINT "WorldBossState_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldBossState" ADD CONSTRAINT "WorldBossState_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenTreasure" ADD CONSTRAINT "HiddenTreasure_lastDiscoveredBy_fkey" FOREIGN KEY ("lastDiscoveredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenTreasure" ADD CONSTRAINT "HiddenTreasure_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFriend" ADD CONSTRAINT "UserFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFriend" ADD CONSTRAINT "UserFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTemplate" ADD CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterAiConfig" ADD CONSTRAINT "MonsterAiConfig_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTrait" ADD CONSTRAINT "MonsterTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTrait" ADD CONSTRAINT "MonsterTrait_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterLootEntry" ADD CONSTRAINT "MonsterLootEntry_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTemplate" ADD CONSTRAINT "ItemTemplate_masteryClassId_fkey" FOREIGN KEY ("masteryClassId") REFERENCES "ClassTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTemplate" ADD CONSTRAINT "ItemTemplate_weaponTypeId_fkey" FOREIGN KEY ("weaponTypeId") REFERENCES "WeaponType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaponTypePassive" ADD CONSTRAINT "WeaponTypePassive_weaponTypeId_fkey" FOREIGN KEY ("weaponTypeId") REFERENCES "WeaponType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaponTypePassive" ADD CONSTRAINT "WeaponTypePassive_passiveId_fkey" FOREIGN KEY ("passiveId") REFERENCES "PassiveTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroPassive" ADD CONSTRAINT "HeroPassive_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroPassive" ADD CONSTRAINT "HeroPassive_passiveId_fkey" FOREIGN KEY ("passiveId") REFERENCES "PassiveTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterPassive" ADD CONSTRAINT "MonsterPassive_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterPassive" ADD CONSTRAINT "MonsterPassive_passiveId_fkey" FOREIGN KEY ("passiveId") REFERENCES "PassiveTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaponTypeTag" ADD CONSTRAINT "WeaponTypeTag_weaponTypeId_fkey" FOREIGN KEY ("weaponTypeId") REFERENCES "WeaponType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaponTypeTag" ADD CONSTRAINT "WeaponTypeTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "MechanicTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InnGuestbook" ADD CONSTRAINT "InnGuestbook_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InnGuestbook" ADD CONSTRAINT "InnGuestbook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterSpotting" ADD CONSTRAINT "MonsterSpotting_discoveredByUserId_fkey" FOREIGN KEY ("discoveredByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterSpotting" ADD CONSTRAINT "MonsterSpotting_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterSpotting" ADD CONSTRAINT "MonsterSpotting_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterStudyBuff" ADD CONSTRAINT "MonsterStudyBuff_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterStudyBuff" ADD CONSTRAINT "MonsterStudyBuff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InnBardEvent" ADD CONSTRAINT "InnBardEvent_hiredByUserId_fkey" FOREIGN KEY ("hiredByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InnBardEvent" ADD CONSTRAINT "InnBardEvent_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerBounty" ADD CONSTRAINT "PlayerBounty_issuerUserId_fkey" FOREIGN KEY ("issuerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerBounty" ADD CONSTRAINT "PlayerBounty_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalVault" ADD CONSTRAINT "RegionalVault_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalVault" ADD CONSTRAINT "RegionalVault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultItem" ADD CONSTRAINT "VaultItem_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultItem" ADD CONSTRAINT "VaultItem_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "RegionalVault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamblingLog" ADD CONSTRAINT "GamblingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TavernRumor" ADD CONSTRAINT "TavernRumor_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TavernRumor" ADD CONSTRAINT "TavernRumor_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TavernRumorPurchase" ADD CONSTRAINT "TavernRumorPurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TavernRumorPurchase" ADD CONSTRAINT "TavernRumorPurchase_rumorId_fkey" FOREIGN KEY ("rumorId") REFERENCES "TavernRumor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TavernEvent" ADD CONSTRAINT "TavernEvent_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalDailyTask" ADD CONSTRAINT "RegionalDailyTask_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDailyTaskProgress" ADD CONSTRAINT "PlayerDailyTaskProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDailyTaskProgress" ADD CONSTRAINT "PlayerDailyTaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "RegionalDailyTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionHazard" ADD CONSTRAINT "RegionHazard_hazardTypeId_fkey" FOREIGN KEY ("hazardTypeId") REFERENCES "HazardType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionHazard" ADD CONSTRAINT "RegionHazard_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionTemplate" ADD CONSTRAINT "RegionTemplate_guildOwnershipId_fkey" FOREIGN KEY ("guildOwnershipId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionTemplate" ADD CONSTRAINT "RegionTemplate_mapMusicId_fkey" FOREIGN KEY ("mapMusicId") REFERENCES "AudioTrack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionTemplate" ADD CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionTemplate" ADD CONSTRAINT "RegionTemplate_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionTemplate" ADD CONSTRAINT "RegionTemplate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "RegionArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResource" ADD CONSTRAINT "EventResource_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventResource" ADD CONSTRAINT "EventResource_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorldEventTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMonster" ADD CONSTRAINT "EventMonster_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMonster" ADD CONSTRAINT "EventMonster_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorldEventTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveEvent" ADD CONSTRAINT "ActiveEvent_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveEvent" ADD CONSTRAINT "ActiveEvent_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorldEventTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionNPC" ADD CONSTRAINT "RegionNPC_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionNPC" ADD CONSTRAINT "RegionNPC_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCTemplate" ADD CONSTRAINT "NPCTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopStock" ADD CONSTRAINT "ShopStock_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopStock" ADD CONSTRAINT "ShopStock_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopStock" ADD CONSTRAINT "ShopStock_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCSchedule" ADD CONSTRAINT "NPCSchedule_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCSchedule" ADD CONSTRAINT "NPCSchedule_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCEventReaction" ADD CONSTRAINT "NPCEventReaction_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCEventReaction" ADD CONSTRAINT "NPCEventReaction_eventTemplateId_fkey" FOREIGN KEY ("eventTemplateId") REFERENCES "WorldEventTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCEventReaction" ADD CONSTRAINT "NPCEventReaction_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCTeleportRoute" ADD CONSTRAINT "NPCTeleportRoute_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCTeleportRoute" ADD CONSTRAINT "NPCTeleportRoute_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCShopItem" ADD CONSTRAINT "NPCShopItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPCShopItem" ADD CONSTRAINT "NPCShopItem_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionMonster" ADD CONSTRAINT "RegionMonster_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionMonster" ADD CONSTRAINT "RegionMonster_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerrainEffect" ADD CONSTRAINT "TerrainEffect_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TavernMercenary" ADD CONSTRAINT "TavernMercenary_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TavernMercenary" ADD CONSTRAINT "TavernMercenary_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionConnection" ADD CONSTRAINT "RegionConnection_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionConnection" ADD CONSTRAINT "RegionConnection_originRegionId_fkey" FOREIGN KEY ("originRegionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionResource" ADD CONSTRAINT "RegionResource_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionResource" ADD CONSTRAINT "RegionResource_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTrait" ADD CONSTRAINT "ItemTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTrait" ADD CONSTRAINT "ItemTrait_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitStat" ADD CONSTRAINT "TraitStat_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemEquipSlot" ADD CONSTRAINT "ItemEquipSlot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemStat" ADD CONSTRAINT "ItemStat_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeTemplate" ADD CONSTRAINT "RecipeTemplate_resultItemId_fkey" FOREIGN KEY ("resultItemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "RecipeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRecipe" ADD CONSTRAINT "UserRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "RecipeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRecipe" ADD CONSTRAINT "UserRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Hero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Hero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroOrder" ADD CONSTRAINT "HeroOrder_targetClassId_fkey" FOREIGN KEY ("targetClassId") REFERENCES "ClassTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroOrder" ADD CONSTRAINT "HeroOrder_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroOrder" ADD CONSTRAINT "HeroOrder_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroOrder" ADD CONSTRAINT "HeroOrder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSkillTree" ADD CONSTRAINT "ClassSkillTree_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSkillTree" ADD CONSTRAINT "ClassSkillTree_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSkill" ADD CONSTRAINT "HeroSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSkill" ADD CONSTRAINT "HeroSkill_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroClassMastery" ADD CONSTRAINT "HeroClassMastery_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroClassMastery" ADD CONSTRAINT "HeroClassMastery_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroBuff" ADD CONSTRAINT "HeroBuff_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTemplate" ADD CONSTRAINT "ClassTemplate_parentClassId_fkey" FOREIGN KEY ("parentClassId") REFERENCES "ClassTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQueue" ADD CONSTRAINT "TaskQueue_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQueue" ADD CONSTRAINT "TaskQueue_originRegionId_fkey" FOREIGN KEY ("originRegionId") REFERENCES "RegionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQueue" ADD CONSTRAINT "TaskQueue_targetItemId_fkey" FOREIGN KEY ("targetItemId") REFERENCES "ItemTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQueue" ADD CONSTRAINT "TaskQueue_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQueue" ADD CONSTRAINT "TaskQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationPreset" ADD CONSTRAINT "FormationPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationSlot" ADD CONSTRAINT "FormationSlot_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationSlot" ADD CONSTRAINT "FormationSlot_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "FormationPreset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroEquipment" ADD CONSTRAINT "HeroEquipment_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroEquipment" ADD CONSTRAINT "HeroEquipment_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemInstanceTrait" ADD CONSTRAINT "ItemInstanceTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemInstanceTrait" ADD CONSTRAINT "ItemInstanceTrait_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOrder" ADD CONSTRAINT "MarketOrder_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOrder" ADD CONSTRAINT "MarketOrder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOrder" ADD CONSTRAINT "MarketOrder_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOrder" ADD CONSTRAINT "MarketOrder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestTemplate" ADD CONSTRAINT "QuestTemplate_turnInNpcId_fkey" FOREIGN KEY ("turnInNpcId") REFERENCES "NPCTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestTemplate" ADD CONSTRAINT "QuestTemplate_questGiverId_fkey" FOREIGN KEY ("questGiverId") REFERENCES "NPCTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestTemplate" ADD CONSTRAINT "QuestTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestStage" ADD CONSTRAINT "QuestStage_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestObjective" ADD CONSTRAINT "QuestObjective_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "QuestStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestReward" ADD CONSTRAINT "QuestReward_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "QuestStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "QuestStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestProgress" ADD CONSTRAINT "UserQuestProgress_userQuestId_fkey" FOREIGN KEY ("userQuestId") REFERENCES "UserQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroTrait" ADD CONSTRAINT "HeroTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroTrait" ADD CONSTRAINT "HeroTrait_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildHistoryMetadata" ADD CONSTRAINT "GuildHistoryMetadata_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "GuildHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildInvite" ADD CONSTRAINT "GuildInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildInvite" ADD CONSTRAINT "GuildInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildInvite" ADD CONSTRAINT "GuildInvite_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildHistory" ADD CONSTRAINT "GuildHistory_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildHistory" ADD CONSTRAINT "GuildHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildHistory" ADD CONSTRAINT "GuildHistory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactionRelation" ADD CONSTRAINT "FactionRelation_factionBId_fkey" FOREIGN KEY ("factionBId") REFERENCES "Faction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactionRelation" ADD CONSTRAINT "FactionRelation_factionAId_fkey" FOREIGN KEY ("factionAId") REFERENCES "Faction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildCreationReqData" ADD CONSTRAINT "GuildCreationReqData_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildFacility" ADD CONSTRAINT "GuildFacility_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildFacilityTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildFacility" ADD CONSTRAINT "GuildFacility_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildPerk" ADD CONSTRAINT "GuildPerk_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siege" ADD CONSTRAINT "Siege_attackerGuildId_fkey" FOREIGN KEY ("attackerGuildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siege" ADD CONSTRAINT "Siege_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiegeLog" ADD CONSTRAINT "SiegeLog_siegeId_fkey" FOREIGN KEY ("siegeId") REFERENCES "Siege"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionLedger" ADD CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalInfluence" ADD CONSTRAINT "RegionalInfluence_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalInfluence" ADD CONSTRAINT "RegionalInfluence_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactionRank" ADD CONSTRAINT "FactionRank_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSaleHistory" ADD CONSTRAINT "HeroSaleHistory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSaleHistory" ADD CONSTRAINT "HeroSaleHistory_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSaleHistory" ADD CONSTRAINT "ItemSaleHistory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSaleHistory" ADD CONSTRAINT "ItemSaleHistory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSaleHistory" ADD CONSTRAINT "ItemSaleHistory_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReputation" ADD CONSTRAINT "UserReputation_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReputation" ADD CONSTRAINT "UserReputation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueNode" ADD CONSTRAINT "DialogueNode_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueChoice" ADD CONSTRAINT "DialogueChoice_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "DialogueNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wagon" ADD CONSTRAINT "Wagon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagonItem" ADD CONSTRAINT "WagonItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagonItem" ADD CONSTRAINT "WagonItem_wagonId_fkey" FOREIGN KEY ("wagonId") REFERENCES "Wagon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootSession" ADD CONSTRAINT "LootSession_wagonId_fkey" FOREIGN KEY ("wagonId") REFERENCES "Wagon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootSession" ADD CONSTRAINT "LootSession_victimId_fkey" FOREIGN KEY ("victimId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LootSession" ADD CONSTRAINT "LootSession_looterId_fkey" FOREIGN KEY ("looterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalExtractionStats" ADD CONSTRAINT "RegionalExtractionStats_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalExtractionStats" ADD CONSTRAINT "RegionalExtractionStats_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroElementalAffinity" ADD CONSTRAINT "HeroElementalAffinity_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentSetPiece" ADD CONSTRAINT "EquipmentSetPiece_setId_fkey" FOREIGN KEY ("setId") REFERENCES "EquipmentSetTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentSetBonus" ADD CONSTRAINT "EquipmentSetBonus_setId_fkey" FOREIGN KEY ("setId") REFERENCES "EquipmentSetTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentSetBonusStat" ADD CONSTRAINT "EquipmentSetBonusStat_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "EquipmentSetBonus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetBonusCondition" ADD CONSTRAINT "SetBonusCondition_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "EquipmentSetBonus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroEquipmentSet" ADD CONSTRAINT "HeroEquipmentSet_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroStatHistory" ADD CONSTRAINT "HeroStatHistory_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryPrimaryStat" ADD CONSTRAINT "HeroHistoryPrimaryStat_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistorySecondaryStat" ADD CONSTRAINT "HeroHistorySecondaryStat_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryEquippedItem" ADD CONSTRAINT "HeroHistoryEquippedItem_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryActiveBuff" ADD CONSTRAINT "HeroHistoryActiveBuff_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroStatAudit" ADD CONSTRAINT "HeroStatAudit_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummonTemplate" ADD CONSTRAINT "SummonTemplate_spawnUnitId_fkey" FOREIGN KEY ("spawnUnitId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTag" ADD CONSTRAINT "MonsterTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "MechanicTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTag" ADD CONSTRAINT "MonsterTag_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterSkill" ADD CONSTRAINT "MonsterSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterSkill" ADD CONSTRAINT "MonsterSkill_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterReaction" ADD CONSTRAINT "MonsterReaction_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "ReactionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterReaction" ADD CONSTRAINT "MonsterReaction_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterAura" ADD CONSTRAINT "MonsterAura_auraId_fkey" FOREIGN KEY ("auraId") REFERENCES "AuraTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterAura" ADD CONSTRAINT "MonsterAura_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterSummon" ADD CONSTRAINT "MonsterSummon_summonId_fkey" FOREIGN KEY ("summonId") REFERENCES "SummonTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterSummon" ADD CONSTRAINT "MonsterSummon_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterImmunity" ADD CONSTRAINT "MonsterImmunity_statusEffectId_fkey" FOREIGN KEY ("statusEffectId") REFERENCES "StatusEffectTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterImmunity" ADD CONSTRAINT "MonsterImmunity_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterVulnerability" ADD CONSTRAINT "MonsterVulnerability_statusEffectId_fkey" FOREIGN KEY ("statusEffectId") REFERENCES "StatusEffectTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterVulnerability" ADD CONSTRAINT "MonsterVulnerability_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterEnrage" ADD CONSTRAINT "MonsterEnrage_enrageId_fkey" FOREIGN KEY ("enrageId") REFERENCES "EnrageCondition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterEnrage" ADD CONSTRAINT "MonsterEnrage_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterCompanion" ADD CONSTRAINT "MonsterCompanion_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterCompanion" ADD CONSTRAINT "MonsterCompanion_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterPhase" ADD CONSTRAINT "MonsterPhase_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "PhaseTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterPhase" ADD CONSTRAINT "MonsterPhase_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterFormation" ADD CONSTRAINT "MonsterFormation_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTerritoryBonus" ADD CONSTRAINT "MonsterTerritoryBonus_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterTerritoryBonus" ADD CONSTRAINT "MonsterTerritoryBonus_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyInstance" ADD CONSTRAINT "PropertyInstance_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyInstance" ADD CONSTRAINT "PropertyInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyGuest" ADD CONSTRAINT "PropertyGuest_guestUserId_fkey" FOREIGN KEY ("guestUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyGuest" ADD CONSTRAINT "PropertyGuest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "PropertyInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalRecoveryStash" ADD CONSTRAINT "RegionalRecoveryStash_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalRecoveryStash" ADD CONSTRAINT "RegionalRecoveryStash_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "PropertyInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalRecoveryStash" ADD CONSTRAINT "RegionalRecoveryStash_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionSpirit" ADD CONSTRAINT "RegionSpirit_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionSpirit" ADD CONSTRAINT "RegionSpirit_spiritId_fkey" FOREIGN KEY ("spiritId") REFERENCES "SpiritTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttribute" ADD CONSTRAINT "UserAttribute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterBehaviorParam" ADD CONSTRAINT "MonsterBehaviorParam_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestVariable" ADD CONSTRAINT "UserQuestVariable_userQuestId_fkey" FOREIGN KEY ("userQuestId") REFERENCES "UserQuest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildHistoryMeta" ADD CONSTRAINT "GuildHistoryMeta_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "GuildHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildCreationRequirement" ADD CONSTRAINT "GuildCreationRequirement_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryStat" ADD CONSTRAINT "HeroHistoryStat_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryEquipment" ADD CONSTRAINT "HeroHistoryEquipment_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryEquipment" ADD CONSTRAINT "HeroHistoryEquipment_itemTemplateId_fkey" FOREIGN KEY ("itemTemplateId") REFERENCES "ItemTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryEquipment" ADD CONSTRAINT "HeroHistoryEquipment_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryBuff" ADD CONSTRAINT "HeroHistoryBuff_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "HeroStatHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroHistoryBuff" ADD CONSTRAINT "HeroHistoryBuff_traitTemplateId_fkey" FOREIGN KEY ("traitTemplateId") REFERENCES "TraitTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateIsland" ADD CONSTRAINT "PrivateIsland_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenPlot" ADD CONSTRAINT "GardenPlot_islandId_fkey" FOREIGN KEY ("islandId") REFERENCES "PrivateIsland"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenPlot" ADD CONSTRAINT "GardenPlot_cropTemplateId_fkey" FOREIGN KEY ("cropTemplateId") REFERENCES "ItemTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenPlot" ADD CONSTRAINT "GardenPlot_seedItemId_fkey" FOREIGN KEY ("seedItemId") REFERENCES "ItemTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslandStorageItem" ADD CONSTRAINT "IslandStorageItem_islandId_fkey" FOREIGN KEY ("islandId") REFERENCES "PrivateIsland"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslandStorageItem" ADD CONSTRAINT "IslandStorageItem_itemTemplateId_fkey" FOREIGN KEY ("itemTemplateId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropTemplate" ADD CONSTRAINT "CropTemplate_seedItemId_fkey" FOREIGN KEY ("seedItemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropTemplate" ADD CONSTRAINT "CropTemplate_harvestItemId_fkey" FOREIGN KEY ("harvestItemId") REFERENCES "ItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemEnchantment" ADD CONSTRAINT "InventoryItemEnchantment_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemEnchantment" ADD CONSTRAINT "InventoryItemEnchantment_enchantmentId_fkey" FOREIGN KEY ("enchantmentId") REFERENCES "ItemEnchantment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GemTemplate" ADD CONSTRAINT "GemTemplate_nextTierGemId_fkey" FOREIGN KEY ("nextTierGemId") REFERENCES "GemTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemSocket" ADD CONSTRAINT "InventoryItemSocket_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItemSocket" ADD CONSTRAINT "InventoryItemSocket_gemId_fkey" FOREIGN KEY ("gemId") REFERENCES "GemTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftingSkill" ADD CONSTRAINT "CraftingSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftingLog" ADD CONSTRAINT "CraftingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonModifierStatMult" ADD CONSTRAINT "DungeonModifierStatMult_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "DungeonModifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonModifierStatusEffect" ADD CONSTRAINT "DungeonModifierStatusEffect_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "DungeonModifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonFloor" ADD CONSTRAINT "DungeonFloor_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "DungeonTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonFloorMonsterPool" ADD CONSTRAINT "DungeonFloorMonsterPool_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "DungeonFloor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonFloorModifier" ADD CONSTRAINT "DungeonFloorModifier_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "DungeonFloor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonFloorModifier" ADD CONSTRAINT "DungeonFloorModifier_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "DungeonModifier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonEntry" ADD CONSTRAINT "DungeonEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonEntry" ADD CONSTRAINT "DungeonEntry_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "DungeonTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonEntryFloorProgress" ADD CONSTRAINT "DungeonEntryFloorProgress_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DungeonEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonEntryRewardClaim" ADD CONSTRAINT "DungeonEntryRewardClaim_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DungeonEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreasureMap" ADD CONSTRAINT "TreasureMap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaMatchParticipant" ADD CONSTRAINT "ArenaMatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "ArenaMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaSeasonTopReward" ADD CONSTRAINT "ArenaSeasonTopReward_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "ArenaSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPrize" ADD CONSTRAINT "TournamentPrize_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentBracket" ADD CONSTRAINT "TournamentBracket_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_achievementCode_fkey" FOREIGN KEY ("achievementCode") REFERENCES "Achievement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAchievementTier" ADD CONSTRAINT "PlayerAchievementTier_playerAchievId_fkey" FOREIGN KEY ("playerAchievId") REFERENCES "PlayerAchievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
