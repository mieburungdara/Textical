/*
  Warnings:

  - Made the column `userId` on table `Hero` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL DEFAULT 'HUMAN',
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
    "luk" INTEGER NOT NULL DEFAULT 5,
    "fire_damage" INTEGER NOT NULL DEFAULT 0,
    "water_damage" INTEGER NOT NULL DEFAULT 0,
    "earth_damage" INTEGER NOT NULL DEFAULT 0,
    "wind_damage" INTEGER NOT NULL DEFAULT 0,
    "light_damage" INTEGER NOT NULL DEFAULT 0,
    "dark_damage" INTEGER NOT NULL DEFAULT 0,
    "defense_base" INTEGER NOT NULL DEFAULT 0,
    "speed_base" INTEGER NOT NULL DEFAULT 5,
    "range_base" INTEGER NOT NULL DEFAULT 1,
    "dodge_chance" REAL NOT NULL DEFAULT 0.05,
    "crit_chance" REAL NOT NULL DEFAULT 0.05,
    "crit_damage" REAL NOT NULL DEFAULT 1.5,
    "block_chance" REAL NOT NULL DEFAULT 0,
    "parry_chance" REAL NOT NULL DEFAULT 0,
    "hp_regen" REAL NOT NULL DEFAULT 0,
    "mana_regen" REAL NOT NULL DEFAULT 2,
    "accuracy_base" INTEGER NOT NULL DEFAULT 100,
    "armor_penetration" INTEGER NOT NULL DEFAULT 0,
    "skill_power_base" INTEGER NOT NULL DEFAULT 10,
    "tenacity_base" REAL NOT NULL DEFAULT 0,
    "block_power_base" REAL NOT NULL DEFAULT 0.5,
    "initiative_base" INTEGER NOT NULL DEFAULT 0,
    "lifesteal_base" REAL NOT NULL DEFAULT 0,
    "spell_vamp" REAL NOT NULL DEFAULT 0,
    "cooldown_reduction" REAL NOT NULL DEFAULT 0,
    "move_speed" REAL NOT NULL DEFAULT 100,
    "attack_speed" REAL NOT NULL DEFAULT 1.0,
    "classId" INTEGER NOT NULL,
    "jobId" INTEGER,
    "vitality" INTEGER NOT NULL DEFAULT 100,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "hasOffspring" BOOLEAN NOT NULL DEFAULT false,
    "fatherId" INTEGER,
    "motherId" INTEGER,
    CONSTRAINT "Hero_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Hero" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Hero" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("accuracy_base", "armor_penetration", "attack_speed", "block_chance", "block_power_base", "classId", "classLevel", "classXp", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "dark_damage", "defense_base", "dex", "dodge_chance", "earth_damage", "fatherId", "fire_damage", "generation", "hasOffspring", "hp_base", "hp_regen", "id", "initiative_base", "int", "isMain", "jobId", "level", "lifesteal_base", "light_damage", "luk", "mana_regen", "motherId", "move_speed", "name", "parry_chance", "race", "range_base", "skill_power_base", "speed_base", "spell_vamp", "str", "tenacity_base", "unitLevel", "unitXp", "userId", "vit", "vitality", "water_damage", "wind_damage", "xp") SELECT "accuracy_base", "armor_penetration", "attack_speed", "block_chance", "block_power_base", "classId", "classLevel", "classXp", "cooldown_reduction", "crit_chance", "crit_damage", "damage_base", "dark_damage", "defense_base", "dex", "dodge_chance", "earth_damage", "fatherId", "fire_damage", "generation", "hasOffspring", "hp_base", "hp_regen", "id", "initiative_base", "int", "isMain", "jobId", "level", "lifesteal_base", "light_damage", "luk", "mana_regen", "motherId", "move_speed", "name", "parry_chance", "race", "range_base", "skill_power_base", "speed_base", "spell_vamp", "str", "tenacity_base", "unitLevel", "unitXp", "userId", "vit", "vitality", "water_damage", "wind_damage", "xp" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
