/*
  Warnings:

  - You are about to drop the column `metadata` on the `RegionTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `TransactionLedger` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `WorldEventTemplate` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visualType" TEXT NOT NULL DEFAULT 'TOWN',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "RegionTemplate_visualType_fkey" FOREIGN KEY ("visualType") REFERENCES "RegionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("dangerLevel", "description", "id", "name", "visualType") SELECT "dangerLevel", "description", "id", "name", "visualType" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_TransactionLedger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "currencyTier" TEXT NOT NULL,
    "amountDelta" INTEGER NOT NULL,
    "newBalance" INTEGER NOT NULL,
    "sourceId" INTEGER,
    "sourceType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TransactionLedger" ("amountDelta", "createdAt", "currencyTier", "id", "newBalance", "type", "userId") SELECT "amountDelta", "createdAt", "currencyTier", "id", "newBalance", "type", "userId" FROM "TransactionLedger";
DROP TABLE "TransactionLedger";
ALTER TABLE "new_TransactionLedger" RENAME TO "TransactionLedger";
CREATE TABLE "new_WorldEventTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_WorldEventTemplate" ("description", "id", "name") SELECT "description", "id", "name" FROM "WorldEventTemplate";
DROP TABLE "WorldEventTemplate";
ALTER TABLE "new_WorldEventTemplate" RENAME TO "WorldEventTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
