const BaseService = require('../BaseService');

/**
 * AssetManifestManager
 * Generates an ID manifest of all available templates in the database.
 */
class AssetManifestManager extends BaseService {
    async getManifest() {
        const regions = await this.db.regionTemplate.findMany({ select: { id: true } });
        const items = await this.db.itemTemplate.findMany({ select: { id: true } });
        const monsters = await this.db.monsterTemplate.findMany({ select: { id: true } });

        return {
            regions: regions.map(r => r.id),
            items: items.map(i => i.id),
            monsters: monsters.map(m => m.id)
        };
    }
}

module.exports = new AssetManifestManager();
