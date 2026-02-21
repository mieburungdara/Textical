/*
  Warnings:

  - You are about to drop the `MarketListing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MarketListing";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MarketOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "creatorId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "initialQuantity" INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL,
    "itemInstanceId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketOrder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketOrder_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketOrder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketOrder_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
