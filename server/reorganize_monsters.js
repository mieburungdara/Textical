const fs = require('fs');
const path = require('path');

const ASSET_ROOT = path.join(__dirname, 'src/data/assets/monsters');

// 1. Definisikan Data Monster Baru yang Terperinci
const monsters = [
    { id: "mob_orc_grunt", categoryId: "orc", name: "Orc Grunt", hp_base: 120, damage_base: 15, defense_base: 5, speed_base: 8, range_base: 1, exp_reward: 25 },
    { id: "mob_orc_king", categoryId: "orc", name: "Orc King", hp_base: 1500, damage_base: 80, defense_base: 40, speed_base: 6, range_base: 1, exp_reward: 800 },
    
    { id: "mob_goblin_scout", categoryId: "goblin", name: "Goblin Scout", hp_base: 60, damage_base: 12, defense_base: 0, speed_base: 18, range_base: 1, exp_reward: 18 },
    
    { id: "mob_skeleton_warrior", categoryId: "skeleton", name: "Skeleton Warrior", hp_base: 90, damage_base: 20, defense_base: 15, speed_base: 7, range_base: 1, exp_reward: 30 },
    { id: "mob_skeleton_archer", categoryId: "skeleton", name: "Skeleton Archer", hp_base: 70, damage_base: 18, defense_base: 5, speed_base: 10, range_base: 4, exp_reward: 35 },
    
    { id: "mob_zombie_shambler", categoryId: "zombie", name: "Zombie Shambler", hp_base: 200, damage_base: 12, defense_base: 2, speed_base: 4, range_base: 1, exp_reward: 22 },
    
    { id: "mob_slime_green", categoryId: "slime", name: "Green Slime", hp_base: 250, damage_base: 8, defense_base: 1, speed_base: 5, range_base: 1, exp_reward: 15 },
    
    { id: "mob_dragon_red", categoryId: "dragon", name: "Ancient Red Dragon", hp_base: 2500, damage_base: 120, defense_base: 60, speed_base: 10, range_base: 5, exp_reward: 1500 }
];

// 2. Bersihkan folder lama
if (fs.existsSync(ASSET_ROOT)) {
    fs.rmSync(ASSET_ROOT, { recursive: true, force: true });
}

// 3. Tulis file di struktur folder yang benar
monsters.forEach(m => {
    const dir = path.join(ASSET_ROOT, m.categoryId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const filePath = path.join(dir, `${m.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(m, null, 2));
    console.log(`Created: monsters/${m.categoryId}/${m.id}.json`);
});
