-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegionTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "connections" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'regions/misc.json'
);
INSERT INTO "new_RegionTemplate" ("connections", "description", "filePath", "id", "name", "type") SELECT "connections", "description", "filePath", "id", "name", "type" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
CREATE TABLE "new_MonsterTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "defense_base" INTEGER NOT NULL,
    "speed_base" INTEGER NOT NULL,
    "range_base" INTEGER NOT NULL,
    "exp_reward" INTEGER NOT NULL,
    "element" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "size" TEXT NOT NULL DEFAULT 'MEDIUM',
    "traits" TEXT NOT NULL DEFAULT '[]',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "immunities" TEXT NOT NULL DEFAULT '[]',
    "lootTable" TEXT NOT NULL DEFAULT '{}',
    "filePath" TEXT NOT NULL DEFAULT 'misc/monster.json',
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "defense_base", "exp_reward", "filePath", "hp_base", "id", "name", "range_base", "speed_base") SELECT "categoryId", "damage_base", "defense_base", "exp_reward", "filePath", "hp_base", "id", "name", "range_base", "speed_base" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_RaceBonusTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bonusData" TEXT NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'races/misc.json'
);
INSERT INTO "new_RaceBonusTemplate" ("bonusData", "filePath", "id") SELECT "bonusData", "filePath", "id" FROM "RaceBonusTemplate";
DROP TABLE "RaceBonusTemplate";
ALTER TABLE "new_RaceBonusTemplate" RENAME TO "RaceBonusTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
