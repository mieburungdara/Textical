const prisma = require('../db');
const fs = require('fs');
const path = require('path');


class DataSyncService {
    /**
     * EXPORT ALL: Database -> JSON
     * This makes Database the true 'Source of Truth'.
     */
    async exportToJson() {
        const stats = { regions: 0, monsters: 0, races: 0, items: 0, registry: 0 };

        // 1. World Regions
        const regions = await prisma.regionTemplate.findMany();
        const regionObj = { regions: {} };
        regions.forEach(r => {
            regionObj.regions[r.id] = {
                name: r.name, 
                type: r.visualType, // mapping visualType to 'type' in JSON for legacy compatibility
                description: r.description,
                gridX: r.gridX,
                gridY: r.gridY,
                connections: r.connections ? r.connections.split(',').map(s => s.trim()) : []
            };
            stats.regions++;
        });
        await fs.promises.writeFile(path.join(__dirname, '../data/world.json'), JSON.stringify(regionObj, null, 2));

        // 5. Items
        const items = await prisma.itemTemplate.findMany();
        const itemObj = { METADATA: {}, TEMPLATES: {}, ITEMS: {} };
        // items.forEach(i => {
        //    itemObj.ITEMS[i.id] = JSON.parse(i.data);
        //    stats.items++;
        // });
        // fs.writeFileSync(path.join(__dirname, '../data/items/stones.json'), JSON.stringify(itemObj, null, 2));

        return stats;
    }

    /**
     * IMPORT ALL: JSON -> Database
     * (Run once to migrate your existing files into the DB)
     */
    async importFromCurrentJson() {
        const stats = { regions: 0, monsters: 0, races: 0, items: 0, registry: 0 };
        
        // Regions
        const worldData = require('../data/world.json');
        for (const id of Object.keys(worldData.regions)) {
            const r = worldData.regions[id];
            await prisma.regionTemplate.upsert({ 
                where: { id: parseInt(id) }, 
                update: {
                    gridX: r.gridX || 0,
                    gridY: r.gridY || 0
                }, 
                create: { 
                    id: parseInt(id), 
                    name: r.name, 
                    visualType: r.type || "TOWN", 
                    description: r.description, 
                    gridX: r.gridX || 0,
                    gridY: r.gridY || 0,
                    connections: (r.connections || []).join(',') 
                } 
            });
            stats.regions++;
        }

        // Monsters
        const monsterData = require('../data/monsters.json');
        for (const id of Object.keys(monsterData)) {
            const m = monsterData[id];
            await prisma.monsterTemplate.upsert({ where: { id }, update: {}, create: { id, name: m.name, hp_base: m.hp_base, damage_base: m.damage_base, defense_base: m.defense_base, speed_base: m.speed_base, range_base: m.range_base, exp_reward: m.exp_reward, image_path: m.image_path } });
            stats.monsters++;
        }

        // Race Bonuses
        const raceData = require('../data/race_bonuses.json');
        for (const id of Object.keys(raceData)) {
            await prisma.raceBonusTemplate.upsert({ where: { id }, update: {}, create: { id, bonusData: JSON.stringify(raceData[id]) } });
            stats.races++;
        }

        // Registry (Pecah Registry.js kembali ke kategori)
        const Registry = require('../data/registry');
        await prisma.registryTemplate.upsert({ where: { id: "traits" }, update: {}, create: { id: "traits", content: JSON.stringify(Registry.TRAITS, null, 4) } });
        await prisma.registryTemplate.upsert({ where: { id: "behaviors" }, update: {}, create: { id: "behaviors", content: JSON.stringify(Registry.BEHAVIORS, null, 4) } });
        stats.registry = 2;

        // Items
        const itemFile = require('../data/items/stones.json');
        for (const id of Object.keys(itemFile.ITEMS)) {
            const i = itemFile.ITEMS[id];
            await prisma.itemTemplate.upsert({ where: { id }, update: {}, create: { id, name: i.name, type: i.type || "MATERIAL", rarity: i.rarity, price: i.price || 0, data: JSON.stringify(i) } });
            stats.items++;
        }

        return stats;
    }
}

module.exports = new DataSyncService();