-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonsterTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "defense_base" INTEGER NOT NULL DEFAULT 0,
    "speed_base" INTEGER NOT NULL DEFAULT 5,
    "range_base" INTEGER NOT NULL DEFAULT 1,
    "accuracy_base" INTEGER NOT NULL DEFAULT 100,
    "dodge_rate" REAL NOT NULL DEFAULT 0.05,
    "crit_chance" REAL NOT NULL DEFAULT 0.05,
    "crit_damage" REAL NOT NULL DEFAULT 1.5,
    "block_chance" REAL NOT NULL DEFAULT 0,
    "block_power_base" REAL NOT NULL DEFAULT 0.5,
    "initiative_base" INTEGER NOT NULL DEFAULT 0,
    "lifesteal_base" REAL NOT NULL DEFAULT 0,
    "cooldown_reduction" REAL NOT NULL DEFAULT 0,
    "move_speed" REAL NOT NULL DEFAULT 100,
    "attack_speed" REAL NOT NULL DEFAULT 1.0,
    "behaviorTree" TEXT NOT NULL DEFAULT 'SimpleAI',
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("behaviorTree", "categoryId", "damage_base", "hp_base", "id", "name") SELECT "behaviorTree", "categoryId", "damage_base", "hp_base", "id", "name" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
