/*
  Warnings:

  - You are about to drop the `ItemTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistryTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `image_path` on the `MonsterTemplate` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RegistryTemplate";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonsterTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "defense_base" INTEGER NOT NULL,
    "speed_base" INTEGER NOT NULL,
    "range_base" INTEGER NOT NULL,
    "exp_reward" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json'
);
INSERT INTO "new_MonsterTemplate" ("damage_base", "defense_base", "exp_reward", "hp_base", "id", "name", "range_base", "speed_base") SELECT "damage_base", "defense_base", "exp_reward", "hp_base", "id", "name", "range_base", "speed_base" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_RegionTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "connections" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'regions/misc.json'
);
INSERT INTO "new_RegionTemplate" ("connections", "description", "id", "name", "type") SELECT "connections", "description", "id", "name", "type" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_RaceBonusTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bonusData" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'races/misc.json'
);
INSERT INTO "new_RaceBonusTemplate" ("bonusData", "id") SELECT "bonusData", "id" FROM "RaceBonusTemplate";
DROP TABLE "RaceBonusTemplate";
ALTER TABLE "new_RaceBonusTemplate" RENAME TO "RaceBonusTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
