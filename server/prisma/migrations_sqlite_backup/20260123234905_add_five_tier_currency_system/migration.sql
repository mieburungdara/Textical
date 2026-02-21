/*
  Warnings:

  - You are about to drop the `ItemAffix` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemAffix";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "copper" INTEGER NOT NULL DEFAULT 0,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 5,
    "platinum" INTEGER NOT NULL DEFAULT 0,
    "mithril" INTEGER NOT NULL DEFAULT 0,
    "fame" INTEGER NOT NULL DEFAULT 0,
    "currentRegion" INTEGER NOT NULL DEFAULT 1,
    "guildId" INTEGER,
    "guildRole" TEXT NOT NULL DEFAULT 'MEMBER',
    CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("copper", "currentRegion", "fame", "gold", "guildId", "guildRole", "id", "password", "username") SELECT "copper", "currentRegion", "fame", "gold", "guildId", "guildRole", "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
