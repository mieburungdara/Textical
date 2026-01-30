-- CreateTable
CREATE TABLE "HeroClassMastery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "isMastered" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HeroClassMastery_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroClassMastery_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "name" TEXT NOT NULL,
    "unitLevel" INTEGER NOT NULL DEFAULT 1,
    "unitXp" INTEGER NOT NULL DEFAULT 0,
    "classLevel" INTEGER NOT NULL DEFAULT 1,
    "classXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "hp_base" INTEGER NOT NULL DEFAULT 100,
    "damage_base" INTEGER NOT NULL DEFAULT 10,
    "str" INTEGER NOT NULL DEFAULT 10,
    "dex" INTEGER NOT NULL DEFAULT 10,
    "int" INTEGER NOT NULL DEFAULT 10,
    "vit" INTEGER NOT NULL DEFAULT 10,
    "classId" INTEGER NOT NULL,
    "jobId" INTEGER,
    "vitality" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("classId", "damage_base", "dex", "hp_base", "id", "int", "jobId", "level", "name", "str", "userId", "vit", "vitality", "xp") SELECT "classId", "damage_base", "dex", "hp_base", "id", "int", "jobId", "level", "name", "str", "userId", "vit", "vitality", "xp" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "HeroClassMastery_heroId_classId_key" ON "HeroClassMastery"("heroId", "classId");
