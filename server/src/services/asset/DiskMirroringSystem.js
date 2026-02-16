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
        cats.forEach(async c => {
            const dir = path.join(ASSET_ROOT, c);
            try {
                await fs.promises.access(dir);
            } catch {
                await fs.promises.mkdir(dir, { recursive: true });
            }
        });
    }

    async writeAsset(category, id, data) {
        const filePath = path.join(ASSET_ROOT, category, `${id}.json`);
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`[ASSET] Mirrored: ${category}/${id}.json`);
    }
}

module.exports = new DiskMirroringSystem();
