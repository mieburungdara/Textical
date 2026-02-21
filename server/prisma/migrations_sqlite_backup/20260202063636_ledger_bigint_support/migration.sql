/*
  Warnings:

  - You are about to alter the column `copperBalance` on the `TransactionLedger` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `copperDelta` on the `TransactionLedger` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransactionLedger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "currencyTier" TEXT NOT NULL,
    "copperDelta" BIGINT NOT NULL DEFAULT 0,
    "copperBalance" BIGINT NOT NULL DEFAULT 0,
    "sourceId" INTEGER,
    "sourceType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TransactionLedger" ("copperBalance", "copperDelta", "createdAt", "currencyTier", "id", "sourceId", "sourceType", "type", "userId") SELECT "copperBalance", "copperDelta", "createdAt", "currencyTier", "id", "sourceId", "sourceType", "type", "userId" FROM "TransactionLedger";
DROP TABLE "TransactionLedger";
ALTER TABLE "new_TransactionLedger" RENAME TO "TransactionLedger";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
