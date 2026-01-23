/*
  Warnings:

  - You are about to drop the `RaceBonusTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `category` on the `MonsterTemplate` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `MonsterTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RaceBonusTemplate";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MonsterCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json',
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("damage_base", "defense_base", "exp_reward", "filePath", "hp_base", "id", "name", "range_base", "speed_base") SELECT "damage_base", "defense_base", "exp_reward", "filePath", "hp_base", "id", "name", "range_base", "speed_base" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
