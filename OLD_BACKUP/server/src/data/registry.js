/**
 * AAA Master Registry for Textical RPG
 * Centralizes all Traits, Behaviors, and soon Skills/Classes.
 */
const Registry = {
    MONSTER_CATEGORIES: [
        "ORC", "SLIME", "UNDEAD", "DRAGON", "BEAST", "GOLEM", "DEMON", "MISC"
    ],
    TRAITS: {
        // --- NATURAL TRAITS ---
        "giant_blood": {
            type: "NATURAL",
            name: "Giant Blood",
            description: "Immense physical power but moves slowly.",
            bonuses: { hp_mult: 1.5, damage_mult: 1.2, speed_mult: 0.8 }
        },
        "keen_eye": {
            type: "NATURAL",
            name: "Keen Eye",
            description: "Natural born marksman.",
            bonuses: { range_bonus: 1, crit_mult: 1.2 }
        },
        "glass_cannon": {
            type: "NATURAL",
            name: "Glass Cannon",
            description: "+50% DMG, -30% HP.",
            bonuses: { damage_mult: 1.5, hp_mult: 0.7 }
        },

        // --- ACQUIRED TRAITS ---
        "dragon_slayer": {
            type: "ACQUIRED",
            name: "Dragon Slayer",
            description: "Master of fighting dragons. +50% DMG against Dragonkin.",
            condition: { type: "KILL_COUNT", target: "dragonkin", amount: 1000 },
            bonuses: { damage_mult: 1.1 } // Base bonus, specific vs dragon handled in BattleRules
        },
        "lava_walker": {
            type: "ACQUIRED",
            name: "Lava Walker",
            description: "Born from the heat. Immune to Lava damage.",
            condition: { type: "STEP_COUNT", target: "lava", amount: 5000 },
            bonuses: { res_fire_bonus: 0.5 }
        }
    },

    BEHAVIORS: {
        "balanced": { type: "NATURAL", name: "Balanced", description: "Standard tactical AI." },
        "coward": { type: "NATURAL", name: "Coward", description: "Runs to Flee Grid at 40% HP." },
        "berserker": { type: "NATURAL", name: "Berserker", description: "Aggressive, targets closest." },
        
        "assassin": { 
            type: "ACQUIRED", 
            name: "Assassin", 
            description: "Prioritizes low HP backline targets.",
            condition: { type: "BACKLINE_KILLS", amount: 100 } 
        },
        "guardian": { 
            type: "ACQUIRED", 
            name: "Guardian", 
            description: "Protects low HP allies.",
            condition: { type: "DAMAGE_ABSORBED", amount: 10000 } 
        }
    }
};

module.exports = Registry;