const fs = require('fs');
const path = require('path');

const ASSET_ROOT = path.join(__dirname, '../../../public/assets/raw');

/**
 * DiskMirroringSystem
 * Manages the physical synchronization of data fragments to the filesystem.
 */
class DiskMirroringSystem {
    constructor() {
        this._ensureDirs();
    }

    _ensureDirs() {
        const cats = ["regions", "items", "monsters", "quests"];
        cats.forEach(c => {
            const dir = path.join(ASSET_ROOT, c);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });
    }

    writeAsset(category, id, data) {
        const filePath = path.join(ASSET_ROOT, category, `${id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`[ASSET] Mirrored: ${category}/${id}.json`);
    }
}

module.exports = new DiskMirroringSystem();
