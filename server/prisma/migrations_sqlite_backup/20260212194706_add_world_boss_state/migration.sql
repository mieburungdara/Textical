/*
  Warnings:

  - You are about to drop the column `bossId` on the `WorldBossState` table. All the data in the column will be lost.
  - You are about to drop the column `lastAttack` on the `WorldBossState` table. All the data in the column will be lost.
  - You are about to alter the column `currentHp` on the `WorldBossState` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - Added the required column `monsterId` to the `WorldBossState` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WorldBossState` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorldBossState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "killedAt" DATETIME,
    "killedByUserId" INTEGER,
    "killedByUserName" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorldBossState_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorldBossState_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorldBossState_killedByUserId_fkey" FOREIGN KEY ("killedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WorldBossState" ("currentHp", "id", "regionId") SELECT "currentHp", "id", "regionId" FROM "WorldBossState";
DROP TABLE "WorldBossState";
ALTER TABLE "new_WorldBossState" RENAME TO "WorldBossState";
CREATE UNIQUE INDEX "WorldBossState_monsterId_key" ON "WorldBossState"("monsterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
