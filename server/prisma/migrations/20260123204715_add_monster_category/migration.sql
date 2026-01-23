-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonsterTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL DEFAULT 'misc',
    "name" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "defense_base" INTEGER NOT NULL,
    "speed_base" INTEGER NOT NULL,
    "range_base" INTEGER NOT NULL,
    "exp_reward" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json'
);
INSERT INTO "new_MonsterTemplate" ("damage_base", "defense_base", "exp_reward", "filePath", "hp_base", "id", "name", "range_base", "speed_base") SELECT "damage_base", "defense_base", "exp_reward", "filePath", "hp_base", "id", "name", "range_base", "speed_base" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
