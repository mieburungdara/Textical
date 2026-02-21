/*
  Warnings:

  - You are about to drop the `ItemAffix` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemAffix";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "vaultGold" INTEGER NOT NULL DEFAULT 0,
    "unlockedPerks" TEXT NOT NULL DEFAULT '[]',
    "facilities" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guild_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "GuildTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePerks" TEXT NOT NULL DEFAULT '{}',
    "progressionTree" TEXT NOT NULL DEFAULT '[]',
    "creationReqs" TEXT NOT NULL DEFAULT '{}',
    "primaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/guilds/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'guilds/misc.json'
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 500,
    "fame" INTEGER NOT NULL DEFAULT 0,
    "currentRegion" TEXT NOT NULL DEFAULT 'starting_village',
    "guildId" TEXT,
    "guildRole" TEXT NOT NULL DEFAULT 'MEMBER',
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("currentRegion", "fame", "gold", "id", "password", "username") SELECT "currentRegion", "fame", "gold", "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");
