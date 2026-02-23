/*
  Warnings:

  - You are about to drop the `WeaponPassive` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WeaponPassive";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PassiveTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WeaponTypePassive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weaponTypeId" INTEGER NOT NULL,
    "passiveId" INTEGER NOT NULL,
    CONSTRAINT "WeaponTypePassive_weaponTypeId_fkey" FOREIGN KEY ("weaponTypeId") REFERENCES "WeaponType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WeaponTypePassive_passiveId_fkey" FOREIGN KEY ("passiveId") REFERENCES "PassiveTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroPassive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "passiveId" INTEGER NOT NULL,
    CONSTRAINT "HeroPassive_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroPassive_passiveId_fkey" FOREIGN KEY ("passiveId") REFERENCES "PassiveTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonsterPassive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "passiveId" INTEGER NOT NULL,
    CONSTRAINT "MonsterPassive_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonsterPassive_passiveId_fkey" FOREIGN KEY ("passiveId") REFERENCES "PassiveTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WeaponTypePassive_weaponTypeId_passiveId_key" ON "WeaponTypePassive"("weaponTypeId", "passiveId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroPassive_heroId_passiveId_key" ON "HeroPassive"("heroId", "passiveId");

-- CreateIndex
CREATE UNIQUE INDEX "MonsterPassive_monsterId_passiveId_key" ON "MonsterPassive"("monsterId", "passiveId");

-- RedefineIndex (safe for SQLite: create if not exists, skip drop of autoindex)
CREATE UNIQUE INDEX IF NOT EXISTS "ArenaRating_playerId_seasonId_key" ON "ArenaRating"("playerId", "seasonId");

-- RedefineIndex (safe for SQLite: create if not exists, skip drop of autoindex)
CREATE UNIQUE INDEX IF NOT EXISTS "TreasureLootTable_rarity_lootType_itemTemplateId_key" ON "TreasureLootTable"("rarity", "lootType", "itemTemplateId");
