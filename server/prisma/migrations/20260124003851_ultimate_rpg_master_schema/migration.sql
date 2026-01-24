/*
  Warnings:

  - You are about to drop the `ItemAffix` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `isNatural` on the `HeroTrait` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemAffix";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "HeroAuctionListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "startingPrice" INTEGER NOT NULL,
    "currentBid" INTEGER NOT NULL DEFAULT 0,
    "buyoutPrice" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HeroAuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroBid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "bidderId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "bidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HeroBid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "HeroAuctionListing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroBid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HeroTrait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    CONSTRAINT "HeroTrait_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroTrait" ("heroId", "id", "traitId") SELECT "heroId", "id", "traitId" FROM "HeroTrait";
DROP TABLE "HeroTrait";
ALTER TABLE "new_HeroTrait" RENAME TO "HeroTrait";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "HeroAuctionListing_heroId_key" ON "HeroAuctionListing"("heroId");
