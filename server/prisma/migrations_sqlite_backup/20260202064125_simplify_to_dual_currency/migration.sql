/*
  Warnings:

  - You are about to drop the column `copperBalance` on the `TransactionLedger` table. All the data in the column will be lost.
  - You are about to drop the column `copperDelta` on the `TransactionLedger` table. All the data in the column will be lost.
  - You are about to drop the column `copper` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `diamond` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `platinum` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransactionLedger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "currencyTier" TEXT NOT NULL,
    "silverDelta" BIGINT NOT NULL DEFAULT 0,
    "silverBalance" BIGINT NOT NULL DEFAULT 0,
    "sourceId" INTEGER,
    "sourceType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TransactionLedger" ("createdAt", "currencyTier", "id", "sourceId", "sourceType", "type", "userId") SELECT "createdAt", "currencyTier", "id", "sourceId", "sourceType", "type", "userId" FROM "TransactionLedger";
DROP TABLE "TransactionLedger";
ALTER TABLE "new_TransactionLedger" RENAME TO "TransactionLedger";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
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
INSERT INTO "new_User" ("currentRegion", "factionId", "gold", "guildId", "id", "isInTavern", "isKnockedOut", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality") SELECT "currentRegion", "factionId", "gold", "guildId", "id", "isInTavern", "isKnockedOut", "knockedOutUntil", "lastPvpAction", "lastQuestResetAt", "lastTavernResetAt", "lastVisitedCityId", "lastVitalityUpdate", "maxInventorySlots", "maxVitality", "password", "premiumTierId", "pvpFlagged", "recoveryUntil", "silver", "tavernEntryAt", "tavernTimeSecondsToday", "username", "vitality" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
