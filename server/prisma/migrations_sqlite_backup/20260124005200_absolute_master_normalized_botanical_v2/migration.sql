-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("id", "message", "type", "userId") SELECT "id", "message", "type", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE TABLE "new_HeroAuctionListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HeroAuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroAuctionListing" ("expiresAt", "heroId", "id", "sellerId", "templateId") SELECT "expiresAt", "heroId", "id", "sellerId", "templateId" FROM "HeroAuctionListing";
DROP TABLE "HeroAuctionListing";
ALTER TABLE "new_HeroAuctionListing" RENAME TO "HeroAuctionListing";
CREATE UNIQUE INDEX "HeroAuctionListing_heroId_key" ON "HeroAuctionListing"("heroId");
CREATE TABLE "new_ItemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'EQUIPMENT',
    "subCategory" TEXT NOT NULL DEFAULT 'MISC',
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "baseDurability" INTEGER NOT NULL DEFAULT 100,
    "repairCostPerPt" INTEGER NOT NULL DEFAULT 1,
    "maxSockets" INTEGER NOT NULL DEFAULT 0,
    "allowedSockets" TEXT NOT NULL DEFAULT '[]',
    "isCraftable" BOOLEAN NOT NULL DEFAULT true,
    "salvageResult" TEXT NOT NULL DEFAULT '[]',
    "setId" INTEGER,
    "filePath" TEXT NOT NULL DEFAULT 'items/misc.json',
    CONSTRAINT "ItemTemplate_setId_fkey" FOREIGN KEY ("setId") REFERENCES "ItemSet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ItemTemplate" ("baseDurability", "category", "description", "filePath", "id", "name", "rarity", "repairCostPerPt", "setId", "subCategory") SELECT "baseDurability", "category", "description", "filePath", "id", "name", "rarity", "repairCostPerPt", "setId", "subCategory" FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "new_ItemTemplate" RENAME TO "ItemTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
