/*
  Warnings:

  - You are about to drop the column `facilityKey` on the `GuildFacility` table. All the data in the column will be lost.
  - Added the required column `templateId` to the `GuildFacility` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "GuildFacilityTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statKey" TEXT,
    "statValuePerLevel" REAL,
    "costBase" INTEGER NOT NULL DEFAULT 1000,
    "costMult" REAL NOT NULL DEFAULT 1.5
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildFacility" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "GuildFacility_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GuildFacility_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildFacilityTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GuildFacility" ("guildId", "id", "level") SELECT "guildId", "id", "level" FROM "GuildFacility";
DROP TABLE "GuildFacility";
ALTER TABLE "new_GuildFacility" RENAME TO "GuildFacility";
CREATE UNIQUE INDEX "GuildFacility_guildId_templateId_key" ON "GuildFacility"("guildId", "templateId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
