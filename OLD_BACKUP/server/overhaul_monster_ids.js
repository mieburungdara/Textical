const fs = require('fs');
const path = require('path');

const ASSET_ROOT = path.join(__dirname, 'src/data/assets/monsters');

const monsterMap = {
    "mob_dragon_red": 5001,
    "mob_orc_grunt": 5002,
    "mob_orc_king": 5003,
    "mob_goblin_scout": 5004,
    "mob_skeleton_warrior": 5005,
    "mob_skeleton_archer": 5006,
    "mob_slime_green": 5007,
    "mob_zombie_shambler": 5008
};

// Scan and update monster IDs
function overhaulMonsterIds(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) overhaulMonsterIds(fullPath);
        else if (file.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            if (typeof data.id === 'string') {
                const oldId = data.id;
                data.id = monsterMap[oldId] || 9999;
                fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
                console.log(`Overhauled ${file}: ${oldId} -> ${data.id}`);
            }
        }
    });
}

overhaulMonsterIds(ASSET_ROOT);
