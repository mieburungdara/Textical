const prisma = require('../db');

/**
 * AssetService
 * Manages granular data fragments for Client-Side caching.
 * Converts DB records into JSON assets for regions, items, and monsters.
 */
class AssetService {
    async getManifest() {
        const regions = await prisma.regionTemplate.findMany({ select: { id: true } });
        const items = await prisma.itemTemplate.findMany({ select: { id: true } });
        const monsters = await prisma.monsterTemplate.findMany({ select: { id: true } });

        return {
            regions: regions.map(r => r.id),
            items: items.map(i => i.id),
            monsters: monsters.map(m => m.id)
        };
    }

    async getRawAsset(category, id) {
        let data = null;
        const idInt = parseInt(id);

        switch (category) {
            case "regions":
                data = await prisma.regionTemplate.findUnique({ where: { id: idInt } });
                break;
            case "items":
                data = await prisma.itemTemplate.findUnique({ where: { id: idInt }, include: { stats: true, traits: true } });
                break;
            case "monsters":
                data = await prisma.monsterTemplate.findUnique({ where: { id: idInt }, include: { loot: true } });
                break;
        }

        if (!data) throw new Error(`Asset ${category}/${id} not found.`);
        return data;
    }
}

module.exports = new AssetService();