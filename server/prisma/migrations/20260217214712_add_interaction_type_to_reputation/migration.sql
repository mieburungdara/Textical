/*
  Warnings:

  - Added the required column `updatedAt` to the `PlayerReputation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerReputation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "comment" TEXT,
    "interactionType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PlayerReputation" ("comment", "createdAt", "fromUserId", "id", "toUserId", "type") SELECT "comment", "createdAt", "fromUserId", "id", "toUserId", "type" FROM "PlayerReputation";
DROP TABLE "PlayerReputation";
ALTER TABLE "new_PlayerReputation" RENAME TO "PlayerReputation";
CREATE INDEX "PlayerReputation_toUserId_idx" ON "PlayerReputation"("toUserId");
CREATE INDEX "PlayerReputation_fromUserId_idx" ON "PlayerReputation"("fromUserId");
CREATE UNIQUE INDEX "PlayerReputation_fromUserId_toUserId_key" ON "PlayerReputation"("fromUserId", "toUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
