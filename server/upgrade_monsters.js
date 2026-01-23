const fs = require('fs');
const path = require('path');

const ASSET_ROOT = path.join(__dirname, 'src/data/assets/monsters');

const complexMonsters = [
    { 
        id: "mob_orc_king", 
        categoryId: "orc", 
        name: "Orc King", 
        hp_base: 1500, damage_base: 85, defense_base: 40, speed_base: 6, range_base: 1, exp_reward: 800,
        element: "EARTH",
        size: "LARGE",
        traits: ["fearless", "commander_aura"],
        skills: ["war_cry", "heavy_bash"],
        immunities: ["stun", "fear"],
        lootTable: { gold_min: 500, gold_max: 1200, drops: ["stn_ruby_05"] }
    },
    { 
        id: "mob_skeleton_warrior", 
        categoryId: "skeleton", 
        name: "Skeleton Warrior", 
        hp_base: 90, damage_base: 22, defense_base: 15, speed_base: 7, range_base: 1, exp_reward: 35,
        element: "DARK",
        size: "MEDIUM",
        traits: ["undead_resilience"],
        skills: ["thrust"],
        immunities: ["poison", "bleed", "fear"],
        lootTable: { gold_min: 10, gold_max: 30 }
    },
    { 
        id: "mob_slime_green", 
        categoryId: "slime", 
        name: "Green Slime", 
        hp_base: 300, damage_base: 10, defense_base: 2, speed_base: 5, range_base: 1, exp_reward: 20,
        element: "WATER",
        size: "SMALL",
        traits: ["split_on_death", "acidic_body"],
        skills: ["jump_attack"],
        immunities: ["blunt_damage"],
        lootTable: { gold_min: 5, gold_max: 15 }
    }
];

complexMonsters.forEach(m => {
    const dir = path.join(ASSET_ROOT, m.categoryId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${m.id}.json`), JSON.stringify(m, null, 2));
    console.log(`Upgraded: ${m.name} with AAA attributes.`);
});
