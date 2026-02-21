-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "isSoulbound" BOOLEAN NOT NULL DEFAULT false,
    "isStolen" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("currentDurability", "id", "isCursed", "isSoulbound", "isTrash", "maxDurability", "powerScale", "quality", "quantity", "templateId", "userId") SELECT "currentDurability", "id", "isCursed", "isSoulbound", "isTrash", "maxDurability", "powerScale", "quality", "quantity", "templateId", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isPvpFlagged" BOOLEAN NOT NULL DEFAULT false,
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
    "moral" INTEGER NOT NULL DEFAULT 100,
    "bindPointId" INTEGER,
    "restingXpPool" INTEGER NOT NULL DEFAULT 0,
    "infamyScore" INTEGER NOT NULL DEFAULT 0,
    "informantReputation" REAL NOT NULL DEFAULT 0.0,
    "banditReputation" REAL NOT NULL DEFAULT 0.0,
    "escortGridsRemaining" INTEGER NOT NULL DEFAULT 0,
    "activeEscortName" TEXT,
    CONSTRAINT "User_bindPointId_fkey" FOREIGN KEY ("bindPointId") REFERENCES "RegionTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_premiumTierId_fkey" FOREIGN KEY ("premiumTierId") REFERENCES "PremiumTierTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_currentRegion_fkey" FOREIGN KEY ("currentRegion") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("bindPointId", "currentRegion", "factionId", "gold", "guildId", "guildRole", "id", "infamyScore", "informantReputation", "isInTavern", "isKnockedOut", "isPvpFlagged", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "moral", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "restingXpPool", "settings", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality") SELECT "bindPointId", "currentRegion", "factionId", "gold", "guildId", "guildRole", "id", "infamyScore", "informantReputation", "isInTavern", "isKnockedOut", "isPvpFlagged", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "moral", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "restingXpPool", "settings", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
