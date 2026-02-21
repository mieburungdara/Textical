/*
  Warnings:

  - You are about to drop the column `metadata` on the `NPCTemplate` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "NPCTeleportRoute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" INTEGER NOT NULL,
    "targetRegionId" INTEGER NOT NULL,
    CONSTRAINT "NPCTeleportRoute_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NPCTeleportRoute_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NPCTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isWanderer" BOOLEAN NOT NULL DEFAULT false,
    "healCost" INTEGER,
    "betMultiplier" REAL,
    "betWinChance" REAL,
    "travelCost" INTEGER
);
INSERT INTO "new_NPCTemplate" ("description", "id", "name", "title", "type") SELECT "description", "id", "name", "title", "type" FROM "NPCTemplate";
DROP TABLE "NPCTemplate";
ALTER TABLE "new_NPCTemplate" RENAME TO "NPCTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "NPCTeleportRoute_npcId_targetRegionId_key" ON "NPCTeleportRoute"("npcId", "targetRegionId");
