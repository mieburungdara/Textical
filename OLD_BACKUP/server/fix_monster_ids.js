const fs = require('fs');
const path = require('path');

const ASSET_ROOT = path.join(__dirname, 'src/data/assets/monsters');

const categoryMap = {
    "orc": 101,
    "goblin": 102,
    "skeleton": 103,
    "zombie": 104,
    "slime": 105,
    "dragon": 106
};

// Scan all monster files and update categoryId to Int
function updateMonsters(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updateMonsters(fullPath);
        } else if (file.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            if (typeof data.categoryId === 'string') {
                const oldCat = data.categoryId;
                data.categoryId = categoryMap[oldCat] || 999;
                fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
                console.log(`Updated ${file}: ${oldCat} -> ${data.categoryId}`);
            }
        }
    });
}

updateMonsters(ASSET_ROOT);
