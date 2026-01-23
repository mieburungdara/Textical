/*
  Warnings:

  - You are about to drop the column `equipmentAccess` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `growthRates` on the `ClassTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `skillUnlocks` on the `ClassTemplate` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "statSystem" TEXT NOT NULL DEFAULT '{}',
    "masteries" TEXT NOT NULL DEFAULT '{}',
    "mechanics" TEXT NOT NULL DEFAULT '{}',
    "skillTree" TEXT NOT NULL DEFAULT '[]',
    "innateTraits" TEXT NOT NULL DEFAULT '[]',
    "promotionReqs" TEXT NOT NULL DEFAULT '{}',
    "nextClasses" TEXT NOT NULL DEFAULT '[]',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/classes/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'classes/misc.json'
);
INSERT INTO "new_ClassTemplate" ("description", "filePath", "iconPath", "id", "innateTraits", "name", "nextClasses", "promotionReqs", "tier") SELECT "description", "filePath", "iconPath", "id", "innateTraits", "name", "nextClasses", "promotionReqs", "tier" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
