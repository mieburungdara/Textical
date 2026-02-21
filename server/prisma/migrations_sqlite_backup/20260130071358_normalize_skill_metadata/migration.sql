/*
  Warnings:

  - You are about to drop the column `metadata` on the `SkillTemplate` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statKey" TEXT,
    "statValue" REAL,
    "power" REAL,
    "duration" INTEGER,
    "multiplier" REAL,
    "manaCost" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_SkillTemplate" ("category", "description", "id", "name", "type") SELECT "category", "description", "id", "name", "type" FROM "SkillTemplate";
DROP TABLE "SkillTemplate";
ALTER TABLE "new_SkillTemplate" RENAME TO "SkillTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
