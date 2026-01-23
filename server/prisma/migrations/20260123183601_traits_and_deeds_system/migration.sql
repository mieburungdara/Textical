/*
  Warnings:

  - You are about to drop the column `stats` on the `Hero` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `race` to the `Hero` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "naturalTraits" TEXT NOT NULL DEFAULT '[]',
    "acquiredTraits" TEXT NOT NULL DEFAULT '[]',
    "unlockedBehaviors" TEXT NOT NULL DEFAULT '[]',
    "activeBehavior" TEXT NOT NULL DEFAULT 'balanced',
    "deeds" TEXT NOT NULL DEFAULT '{}',
    "equipment" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("createdAt", "equipment", "exp", "id", "level", "name", "templateId", "userId") SELECT "createdAt", "equipment", "exp", "id", "level", "name", "templateId", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 500,
    "fame" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("fame", "gold", "id", "password", "username") SELECT "fame", "gold", "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
