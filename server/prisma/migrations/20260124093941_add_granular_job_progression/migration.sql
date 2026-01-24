/*
  Warnings:

  - You are about to drop the column `jobId` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `isFinished` on the `HeroAuctionListing` table. All the data in the column will be lost.
  - Added the required column `description` to the `JobTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "HeroJobProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "masteryPoints" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HeroJobProgress_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroJobProgress_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'skills/misc.json'
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COLLECTION',
    "filePath" TEXT NOT NULL DEFAULT 'jobs/misc.json'
);
INSERT INTO "new_JobTemplate" ("id", "name") SELECT "id", "name" FROM "JobTemplate";
DROP TABLE "JobTemplate";
ALTER TABLE "new_JobTemplate" RENAME TO "JobTemplate";
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classId" INTEGER NOT NULL DEFAULT 1001,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "createdAt", "id", "level", "name", "userId") SELECT "classId", "createdAt", "id", "level", "name", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_HeroAuctionListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sellerId" INTEGER NOT NULL,
    "heroId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "HeroAuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroAuctionListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HeroAuctionListing" ("expiresAt", "heroId", "id", "sellerId", "templateId") SELECT "expiresAt", "heroId", "id", "sellerId", "templateId" FROM "HeroAuctionListing";
DROP TABLE "HeroAuctionListing";
ALTER TABLE "new_HeroAuctionListing" RENAME TO "HeroAuctionListing";
CREATE UNIQUE INDEX "HeroAuctionListing_heroId_key" ON "HeroAuctionListing"("heroId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "HeroJobProgress_heroId_jobId_key" ON "HeroJobProgress"("heroId", "jobId");
