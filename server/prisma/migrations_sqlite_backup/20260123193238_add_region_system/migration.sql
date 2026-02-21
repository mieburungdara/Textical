-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classTier" INTEGER NOT NULL DEFAULT 1,
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "naturalTraits" TEXT NOT NULL DEFAULT '[]',
    "acquiredTraits" TEXT NOT NULL DEFAULT '[]',
    "unlockedBehaviors" TEXT NOT NULL DEFAULT '[]',
    "activeBehavior" TEXT NOT NULL DEFAULT 'balanced',
    "deeds" TEXT NOT NULL DEFAULT '{}',
    "hasReproduced" BOOLEAN NOT NULL DEFAULT false,
    "fatherId" TEXT,
    "motherId" TEXT,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "equipment" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("acquiredTraits", "activeBehavior", "baseStats", "classTier", "createdAt", "deeds", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "level", "motherId", "name", "naturalTraits", "race", "templateId", "unlockedBehaviors", "userId") SELECT "acquiredTraits", "activeBehavior", "baseStats", "classTier", "createdAt", "deeds", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "level", "motherId", "name", "naturalTraits", "race", "templateId", "unlockedBehaviors", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 500,
    "fame" INTEGER NOT NULL DEFAULT 0,
    "currentRegion" TEXT NOT NULL DEFAULT 'starting_village'
);
INSERT INTO "new_User" ("fame", "gold", "id", "password", "username") SELECT "fame", "gold", "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
