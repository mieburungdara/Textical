/**
 * AAA Master Registry for Traits and Behaviors
 */
const Registry = {
    TRAITS: {
        // --- NATURAL TRAITS (Genetic) ---
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
            bonuses: { range_bonus: 1, crit_chance_mult: 1.2 }
        },

        // --- ACQUIRED TRAITS (Experience) ---
        "dragon_slayer": {
            type: "ACQUIRED",
            name: "Dragon Slayer",
            description: "Master of fighting dragons. +50% DMG against Dragonkin.",
            condition: { type: "KILL_COUNT", target: "dragonkin", amount: 1000 },
            bonuses: { special_dmg_vs_dragon: 1.5 }
        },
        "lava_walker": {
            type: "ACQUIRED",
            name: "Lava Walker",
            description: "Born from the heat. Immune to Lava damage.",
            condition: { type: "STEP_COUNT", target: "lava", amount: 5000 },
            bonuses: { lava_immunity: true }
        }
    },

    BEHAVIORS: {
        "balanced": { type: "NATURAL", name: "Balanced", description: "Standard tactical AI." },
        "coward": { type: "NATURAL", name: "Coward", description: "Runs to Flee Grid at 40% HP." },
        
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
