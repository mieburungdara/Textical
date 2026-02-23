const fs = require('fs');
const path = require('path');

const OLD_MONSTERS = path.join(__dirname, 'src/data/monsters.json');
const ASSET_ROOT = path.join(__dirname, 'src/data/assets/monsters');

// Clean up old messed up files first
if (fs.existsSync(ASSET_ROOT)) {
    fs.rmSync(ASSET_ROOT, { recursive: true, force: true });
}

if (fs.existsSync(OLD_MONSTERS)) {
    const data = JSON.parse(fs.readFileSync(OLD_MONSTERS, 'utf-8'));
    
    Object.values(data).forEach(m => {
        const category = m.category || 'misc';
        const fileName = `${m.id}.json`;
        const dir = path.join(ASSET_ROOT, category);
        
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        fs.writeFileSync(path.join(dir, fileName), JSON.stringify(m, null, 2));
        console.log(`Organized: monsters/${category}/${fileName}`);
    });
}