/*
  Warnings:

  - You are about to drop the column `type` on the `RegionTemplate` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "RegionType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegionTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visualType" TEXT NOT NULL DEFAULT 'TOWN',
    "dangerLevel" INTEGER NOT NULL DEFAULT 1,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "RegionTemplate_visualType_fkey" FOREIGN KEY ("visualType") REFERENCES "RegionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegionTemplate" ("dangerLevel", "description", "id", "metadata", "name") SELECT "dangerLevel", "description", "id", "metadata", "name" FROM "RegionTemplate";
DROP TABLE "RegionTemplate";
ALTER TABLE "new_RegionTemplate" RENAME TO "RegionTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
