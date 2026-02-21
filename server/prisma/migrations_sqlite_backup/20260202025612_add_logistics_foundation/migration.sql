-- CreateTable
CREATE TABLE "Wagon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'LOADING',
    "originRegionId" INTEGER,
    "targetRegionId" INTEGER,
    "selectedPath" TEXT,
    "currentPathIndex" INTEGER NOT NULL DEFAULT 0,
    "elapsedTimeInCurrentMap" INTEGER NOT NULL DEFAULT 0,
    "nextAmbushCheckAt" DATETIME,
    "feePaid" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wagon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WagonItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wagonId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "WagonItem_wagonId_fkey" FOREIGN KEY ("wagonId") REFERENCES "Wagon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WagonItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
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
    "factionId" INTEGER,
    "pvpFlagged" BOOLEAN NOT NULL DEFAULT false,
    "lastPvpAction" DATETIME,
    "isKnockedOut" BOOLEAN NOT NULL DEFAULT false,
    "knockedOutUntil" DATETIME,
    "recoveryUntil" DATETIME,
    "lastVisitedCityId" INTEGER,
    CONSTRAINT "User_currentRegion_fkey" FOREIGN KEY ("currentRegion") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_premiumTierId_fkey" FOREIGN KEY ("premiumTierId") REFERENCES "PremiumTierTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("currentRegion", "factionId", "gold", "guildId", "id", "isInTavern", "lastQuestResetAt", "lastTavernResetAt", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "password", "premiumTierId", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality") SELECT "currentRegion", "factionId", "gold", "guildId", "id", "isInTavern", "lastQuestResetAt", "lastTavernResetAt", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "password", "premiumTierId", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentDurability" INTEGER NOT NULL DEFAULT 100,
    "maxDurability" INTEGER NOT NULL DEFAULT 100,
    "isTrash" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("id", "quantity", "templateId", "userId") SELECT "id", "quantity", "templateId", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
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
INSERT INTO "new_Hero" ("classId", "classLevel", "classXp", "damage_base", "dex", "fatherId", "generation", "hasOffspring", "hp_base", "id", "int", "jobId", "level", "motherId", "name", "str", "unitLevel", "unitXp", "userId", "vit", "vitality", "xp") SELECT "classId", "classLevel", "classXp", "damage_base", "dex", "fatherId", "generation", "hasOffspring", "hp_base", "id", "int", "jobId", "level", "motherId", "name", "str", "unitLevel", "unitXp", "userId", "vit", "vitality", "xp" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visualType" TEXT NOT NULL DEFAULT 'TOWN',
    "zoneType" TEXT NOT NULL DEFAULT 'GREEN',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "factionId" INTEGER,
    CONSTRAINT "RegionTemplate_visualType_fkey" FOREIGN KEY ("visualType") REFERENCES "RegionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("dangerLevel", "description", "factionId", "id", "name", "visualType") SELECT "dangerLevel", "description", "factionId", "id", "name", "visualType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Wagon_userId_key" ON "Wagon"("userId");
