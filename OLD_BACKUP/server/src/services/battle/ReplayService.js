const fs = require('fs').promises;
const path = require('path');
const BaseService = require('../BaseService');

class ReplayService extends BaseService {
    constructor() {
        super();
        this.REPLAY_DIR = path.join(__dirname, '../../../../replays');
        // Ensure dir exists
        this._ensureDir();
    }

    async _ensureDir() {
        try {
            await fs.mkdir(this.REPLAY_DIR, { recursive: true });
        } catch (e) {
            console.error("Failed to create replay directory:", e);
        }
    }

    async saveReplay(battleId, logs) {
        const filePath = path.join(this.REPLAY_DIR, `${battleId}.json`);
        // Save with pretty print for easier debugging as requested
        await fs.writeFile(filePath, JSON.stringify(logs, null, 2));
        return filePath;
    }

    async getReplay(battleId) {
        const filePath = path.join(this.REPLAY_DIR, `${battleId}.json`);
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return null; // Not found
        }
    }
}

module.exports = new ReplayService();
