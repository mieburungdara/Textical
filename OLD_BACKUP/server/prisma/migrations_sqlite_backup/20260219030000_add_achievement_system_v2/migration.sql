-- Add Achievement System V2
-- AchievementCategory enum
CREATE TABLE "AchievementCategory" (
    "name" TEXT NOT NULL PRIMARY KEY
);

INSERT INTO "AchievementCategory" ("name") VALUES 
    ('COMBAT'),
    ('COLLECTION'),
    ('ECONOMY'),
    ('CRAFTING'),
    ('PVP'),
    ('EXPLORATION'),
    ('SOCIAL'),
    ('SPECIAL');

-- Achievement model
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (uuid()),
    "code" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COMBAT',
    "icon" TEXT NOT NULL DEFAULT '🏆',
    "requirementType" TEXT NOT NULL DEFAULT 'counter',
    "targetValue" INTEGER NOT NULL DEFAULT 1,
    "counterName" TEXT NOT NULL,
    "isProgressive" INTEGER NOT NULL DEFAULT 0,
    "tiers" TEXT,
    "rewardGold" INTEGER NOT NULL DEFAULT 0,
    "rewardGems" INTEGER NOT NULL DEFAULT 0,
    "rewardItems" TEXT,
    "rewardTitle" TEXT,
    "isHidden" INTEGER NOT NULL DEFAULT 0,
    "hiddenCondition" TEXT,
    "prereqCode" TEXT,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT (now()),
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "Achievement_category_isActive_idx" ON "Achievement" ("category", "isActive");
CREATE INDEX "Achievement_counterName_idx" ON "Achievement" ("counterName");

-- PlayerAchievement model
CREATE TABLE "PlayerAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (uuid()),
    "userId" INTEGER NOT NULL,
    "achievementCode" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME,
    "currentTier" INTEGER NOT NULL DEFAULT 0,
    "unlockedTiers" TEXT NOT NULL DEFAULT '[]',
    "rewardsClaimed" INTEGER NOT NULL DEFAULT 0,
    "claimedAt" DATETIME,
    "isDiscovered" INTEGER NOT NULL DEFAULT 0,
    "discoveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT (now()),
    "updatedAt" DATETIME NOT NULL,
    UNIQUE("userId", "achievementCode")
);

CREATE INDEX "PlayerAchievement_userId_idx" ON "PlayerAchievement" ("userId");

-- PlayerTitle model
CREATE TABLE "PlayerTitle" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (uuid()),
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🎖️',
    "badgeColor" TEXT NOT NULL DEFAULT '#ffffff',
    "source" TEXT NOT NULL,
    "sourceCode" TEXT,
    "isActive" INTEGER NOT NULL DEFAULT 0,
    "activatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT (now()),
    UNIQUE("userId", "title")
);

CREATE INDEX "PlayerTitle_userId_idx" ON "PlayerTitle" ("userId");

-- Add foreign key constraint for PlayerAchievement
-- Note: This references Achievement by code, handled in application layer
