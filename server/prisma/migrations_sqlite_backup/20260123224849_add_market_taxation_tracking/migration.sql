-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MarketHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "soldPrice" INTEGER NOT NULL,
    "taxPaid" INTEGER NOT NULL DEFAULT 0,
    "soldAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL
);
INSERT INTO "new_MarketHistory" ("buyerId", "id", "quantity", "sellerId", "soldAt", "soldPrice", "templateId") SELECT "buyerId", "id", "quantity", "sellerId", "soldAt", "soldPrice", "templateId" FROM "MarketHistory";
DROP TABLE "MarketHistory";
ALTER TABLE "new_MarketHistory" RENAME TO "MarketHistory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
