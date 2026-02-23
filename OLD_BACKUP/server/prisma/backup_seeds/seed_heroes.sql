-- Seed Heroes for HeroProfileScreen
-- Run this after prisma generate and migrate

-- Insert sample heroes
INSERT INTO "Hero" (
    "id", "userId", "name", "unitLevel", "unitXp", "classLevel", "classXp",
    "hp_base", "damage_base", "str", "dex", "int", "vit", "luk",
    "fire_damage", "water_damage", "earth_damage", "wind_damage", "light_damage", "dark_damage",
    "defense_base", "speed_base", "range_base",
    "dodge_chance", "crit_chance", "crit_damage", "block_chance", "parry_chance",
    "hp_regen", "mana_regen",
    "accuracy_base", "armor_penetration", "skill_power_base", "tenacity_base", "block_power_base",
    "initiative_base", "lifesteal_base", "spell_vamp", "cooldown_reduction", "move_speed", "attack_speed",
    "classId", "jobId", "vitality", "isMain", "generation", "hasOffspring"
) VALUES 
(
    1, 1, 'Aldric the Brave', 15, 15000, 15, 15000,
    2500, 380, 50, 25, 20, 60, 15,
    10, -5, 15, 0, 25, -10,
    520, 85, 1,
    0.05, 0.15, 1.8, 0.1, 0.05,
    0, 2,
    100, 0, 50, 0, 0.5,
    0, 0, 0, 0, 100, 1.0,
    2101, NULL, 2500, true, 1, false
),
(
    2, 1, 'Lyra Moonwhisper', 12, 10000, 12, 10000,
    1200, 150, 15, 20, 70, 25, 20,
    -10, 30, 5, 20, 15, -5,
    180, 120, 1,
    0.08, 0.12, 1.6, 0, 0,
    0, 5,
    100, 0, 100, 0, 0.5,
    0, 0, 0.3, 0, 100, 1.2,
    2111, NULL, 1200, false, 1, false
),
(
    3, 1, 'Garret Shadowstep', 18, 20000, 18, 20000,
    1800, 420, 30, 80, 15, 35, 40,
    5, 0, -5, 15, -15, 30,
    280, 200, 1,
    0.15, 0.20, 2.0, 0, 0.05,
    0, 2,
    100, 10, 30, 0, 0.5,
    0, 0.1, 0, 0, 110, 1.3,
    2103, NULL, 1800, false, 1, false
),
(
    4, 1, 'Thorin Ironforge', 10, 5000, 10, 5000,
    2200, 350, 45, 20, 10, 50, 10,
    10, -5, 20, 0, 5, -5,
    400, 70, 1,
    0.03, 0.08, 1.5, 0.08, 0.03,
    0, 1,
    100, 0, 20, 0, 0.5,
    0, 0, 0, 0, 100, 0.9,
    1101, NULL, 2200, false, 1, false
),
(
    5, 1, 'Seraphina Lightbringer', 20, 50000, 20, 50000,
    2800, 280, 25, 30, 65, 55, 25,
    5, 10, 5, 5, 50, -30,
    450, 95, 1,
    0.06, 0.10, 1.7, 0.05, 0.02,
    0, 4,
    100, 0, 80, 0.1, 0.5,
    0, 0, 0.2, 0.05, 100, 1.0,
    1104, NULL, 2800, false, 1, false
);

-- Insert hero elemental affinities
INSERT INTO "HeroElementalAffinity" ("id", "heroId", "element", "value") VALUES
(1, 1, 'FIRE', 10),
(2, 1, 'WATER', -5),
(3, 1, 'EARTH', 15),
(4, 1, 'WIND', 0),
(5, 1, 'LIGHT', 25),
(6, 1, 'DARK', -10),
(7, 2, 'FIRE', -10),
(8, 2, 'WATER', 30),
(9, 2, 'EARTH', 5),
(10, 2, 'WIND', 20),
(11, 2, 'LIGHT', 15),
(12, 2, 'DARK', -5),
(13, 3, 'FIRE', 5),
(14, 3, 'WATER', 0),
(15, 3, 'EARTH', -5),
(16, 3, 'WIND', 15),
(17, 3, 'LIGHT', -15),
(18, 3, 'DARK', 30),
(19, 4, 'FIRE', 10),
(20, 4, 'WATER', -5),
(21, 4, 'EARTH', 20),
(22, 4, 'WIND', 0),
(23, 4, 'LIGHT', 5),
(24, 4, 'DARK', -5),
(25, 5, 'FIRE', 5),
(26, 5, 'WATER', 10),
(27, 5, 'EARTH', 5),
(28, 5, 'WIND', 5),
(29, 5, 'LIGHT', 50),
(30, 5, 'DARK', -30);

-- Insert hero stat allocations
INSERT INTO "HeroStatAllocation" ("id", "heroId", "strPoints", "dexPoints", "intPoints", "vitPoints", "lukPoints", "availablePoints") VALUES
(1, 1, 10, 5, 4, 12, 3, 0),
(2, 2, 3, 4, 14, 5, 4, 0),
(3, 3, 6, 16, 3, 7, 8, 0),
(4, 4, 9, 4, 2, 10, 2, 0),
(5, 5, 5, 6, 13, 11, 5, 0);

-- Insert hero stat history
INSERT INTO "HeroStatHistory" ("id", "heroId", "statKey", "baseValue", "bonusFromItems", "bonusFromBuffs", "allocatedPoints", "lastModifiedAt") VALUES
-- Aldric (Hero 1)
(1, 1, 'HP', 2500, 0, 0, 0, datetime('now')),
(2, 1, 'MP', 450, 0, 0, 0, datetime('now')),
(3, 1, 'ATTACK', 380, 0, 0, 0, datetime('now')),
(4, 1, 'DEFENSE', 520, 0, 0, 0, datetime('now')),
-- Lyra (Hero 2)
(5, 2, 'HP', 1200, 0, 0, 0, datetime('now')),
(6, 2, 'MP', 980, 0, 0, 0, datetime('now')),
(7, 2, 'ATTACK', 150, 0, 0, 0, datetime('now')),
(8, 2, 'MAGIC_ATTACK', 650, 0, 0, 0, datetime('now')),
-- Garret (Hero 3)
(9, 3, 'HP', 1800, 0, 0, 0, datetime('now')),
(10, 3, 'ATTACK', 420, 0, 0, 0, datetime('now')),
(11, 3, 'SPEED', 200, 0, 0, 0, datetime('now')),
-- Thorin (Hero 4)
(12, 4, 'HP', 2200, 0, 0, 0, datetime('now')),
(13, 4, 'ATTACK', 350, 0, 0, 0, datetime('now')),
(14, 4, 'DEFENSE', 400, 0, 0, 0, datetime('now')),
-- Seraphina (Hero 5)
(15, 5, 'HP', 2800, 0, 0, 0, datetime('now')),
(16, 5, 'MP', 800, 0, 0, 0, datetime('now')),
(17, 5, 'MAGIC_ATTACK', 550, 0, 0, 0, datetime('now')),
(18, 5, 'MAGIC_DEFENSE', 600, 0, 0, 0, datetime('now'));

PRINT 'Heroes seeded successfully!';
