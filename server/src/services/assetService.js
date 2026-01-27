const prisma = require('../db');
const fs = require('fs');
const path = require('path');

const ASSET_ROOT = path.join(__dirname, '../../public/assets/raw');

/**
 * AssetService
 * Manages granular data fragments for Client-Side caching.
 * Mirrors DB records to physical JSON files for regions, items, and monsters.
 */
class AssetService {
    constructor() {
        this._ensureDirs();
    }

    _ensureDirs() {
        const cats = ["regions", "items", "monsters"];
        cats.forEach(c => {
            const dir = path.join(ASSET_ROOT, c);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });
    }

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
                data = await prisma.regionTemplate.findUnique({ 
                    where: { id: idInt },
                    include: { resources: { include: { item: true } }, connections: true }
                });
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

    /**
     * DATABASE -> DISK (Full Export)
     */
    async loadAllAssets() {
        console.log("[ASSET] Mirroring Database to Disk...");
        const manifest = await this.getManifest();
        
        for (const rid of manifest.regions) {
            const data = await this.getRawAsset("regions", rid);
            this._writeAsset("regions", rid, data);
        }
        for (const iid of manifest.items) {
            const data = await this.getRawAsset("items", iid);
            this._writeAsset("items", iid, data);
        }
        for (const mid of manifest.monsters) {
            const data = await this.getRawAsset("monsters", mid);
            this._writeAsset("monsters", mid, data);
        }
        console.log("[ASSET] Initial Sync Complete.");
    }

    /**
     * SAVE & MIRROR: MONSTER
     */
    async saveMonster(id, body) {
        const idInt = parseInt(id);
        const updated = await prisma.monsterTemplate.upsert({
            where: { id: idInt },
            update: {
                name: body.name,
                hp_base: parseInt(body.hp_base),
                damage_base: parseInt(body.damage_base),
                categoryId: parseInt(body.categoryId)
            },
            create: {
                id: idInt,
                name: body.name,
                hp_base: parseInt(body.hp_base),
                damage_base: parseInt(body.damage_base),
                categoryId: parseInt(body.categoryId)
            },
            include: { loot: true }
        });

        this._writeAsset("monsters", idInt, updated);
        return updated;
    }

    /**
     * SAVE & MIRROR: REGION
     */
    async saveRegion(id, body) {
        const idInt = parseInt(id);
        const updated = await prisma.regionTemplate.upsert({
            where: { id: idInt },
            update: {
                name: body.name,
                description: body.description,
                type: body.type,
                dangerLevel: parseInt(body.dangerLevel || 1),
                metadata: body.metadata || "{}"
            },
            create: {
                id: idInt,
                name: body.name,
                description: body.description,
                type: body.type,
                dangerLevel: parseInt(body.dangerLevel || 1),
                metadata: body.metadata || "{}"
            }
        });

        this._writeAsset("regions", idInt, updated);
        return updated;
    }

    /**
     * SAVE & MIRROR: ITEM
     */
    async saveItem(id, body) {
        const idInt = parseInt(id);
        const updated = await prisma.itemTemplate.upsert({
            where: { id: idInt },
            update: {
                name: body.name,
                description: body.description,
                category: body.category || "EQUIPMENT",
                rarity: body.rarity || "COMMON",
                baseValue: parseInt(body.baseValue || 10)
            },
            create: {
                id: idInt,
                name: body.name,
                description: body.description,
                category: body.category || "EQUIPMENT",
                rarity: body.rarity || "COMMON",
                baseValue: parseInt(body.baseValue || 10)
            },
            include: { stats: true, traits: true }
        });

        this._writeAsset("items", idInt, updated);
        return updated;
    }

    _writeAsset(category, id, data) {
        const filePath = path.join(ASSET_ROOT, category, `${id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`[ASSET] Mirrored: ${category}/${id}.json`);
    }
}

module.exports = new AssetService();