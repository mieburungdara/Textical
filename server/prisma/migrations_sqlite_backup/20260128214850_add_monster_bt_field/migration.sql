-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "behaviorTree" TEXT NOT NULL DEFAULT 'SimpleAI',
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "hp_base", "id", "name") SELECT "categoryId", "damage_base", "hp_base", "id", "name" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
