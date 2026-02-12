const BaseService = require('./BaseService');
const assetManifestManager = require('./asset/AssetManifestManager');
const diskMirroringSystem = require('./asset/DiskMirroringSystem');

/**
 * AssetService (v2.0 - Modular Orchestrator)
 * Manages granular data fragments for Client-Side caching by composing
 * manifest management and disk mirroring logic.
 */
class AssetService extends BaseService {
    
    async getManifest() {
        return await assetManifestManager.getManifest();
    }

    async getRawAsset(category, id) {
        let data = null;
        const idInt = parseInt(id);

        switch (category) {
            case "regions":
                data = await this.db.regionTemplate.findUnique({ 
                    where: { id: idInt },
                    include: { resources: { include: { item: true } }, connections: true }
                });
                break;
            case "items":
                data = await this.db.itemTemplate.findUnique({ 
                    where: { id: idInt }, 
                    include: { stats: true, traits: true } 
                });
                break;
            case "monsters":
                data = await this.db.monsterTemplate.findUnique({ 
                    where: { id: idInt }, 
                    include: { loot: true, traits: { include: { trait: true } } } 
                });
                break;
            case "quests":
                console.log('[AssetService.DEBUG] Querying questTemplate for id:', idInt);
                data = await this.db.questTemplate.findUnique({ 
                    where: { id: idInt },
                    include: { 
                        stages: { 
                            include: { 
                                objectives: true, 
                                rewards: true 
                            } 
                        },
                        questGiver: true,
                        turnInNpc: true
                    }
                });
                console.log('[AssetService.DEBUG] questTemplate result:', data ? 'found' : 'null');
                break;
        }

        if (!data) throw new Error(`Asset ${category}/${id} not found.`);
        return data;
    }

    async loadAllAssets() {
        console.log("[ASSET] Mirroring Database to Disk...");
        const manifest = await this.getManifest();
        
        for (const rid of manifest.regions) {
            const data = await this.getRawAsset("regions", rid);
            diskMirroringSystem.writeAsset("regions", rid, data);
        }
        for (const iid of manifest.items) {
            const data = await this.getRawAsset("items", iid);
            diskMirroringSystem.writeAsset("items", iid, data);
        }
        for (const mid of manifest.monsters) {
            const data = await this.getRawAsset("monsters", mid);
            diskMirroringSystem.writeAsset("monsters", mid, data);
        }
        console.log("[ASSET] Initial Sync Complete.");
    }

    async saveMonster(id, body) {
        const idInt = parseInt(id);
        const updated = await this.db.monsterTemplate.upsert({
            where: { id: idInt },
            update: {
                name: body.name,
                hp_base: parseInt(body.hp_base),
                damage_base: parseInt(body.damage_base),
                defense_base: parseInt(body.defense_base || 0),
                speed_base: parseInt(body.speed_base || 5),
                range_base: parseInt(body.range_base || 1),
                accuracy_base: parseInt(body.accuracy_base || 100),
                dodge_rate: parseFloat(body.dodge_rate || 0.05),
                crit_chance: parseFloat(body.crit_chance || 0.05),
                crit_damage: parseFloat(body.crit_damage || 1.5),
                block_chance: parseFloat(body.block_chance || 0),
                block_power_base: parseFloat(body.block_power_base || 0.5),
                initiative_base: parseInt(body.initiative_base || 0),
                lifesteal_base: parseFloat(body.lifesteal_base || 0),
                cooldown_reduction: parseFloat(body.cooldown_reduction || 0),
                move_speed: parseFloat(body.move_speed || 100),
                attack_speed: parseFloat(body.attack_speed || 1.0),
                categoryId: parseInt(body.categoryId)
            },
            create: {
                id: idInt,
                name: body.name,
                hp_base: parseInt(body.hp_base),
                damage_base: parseInt(body.damage_base),
                defense_base: parseInt(body.defense_base || 0),
                speed_base: parseInt(body.speed_base || 5),
                range_base: parseInt(body.range_base || 1),
                accuracy_base: parseInt(body.accuracy_base || 100),
                dodge_rate: parseFloat(body.dodge_rate || 0.05),
                crit_chance: parseFloat(body.crit_chance || 0.05),
                crit_damage: parseFloat(body.crit_damage || 1.5),
                block_chance: parseFloat(body.block_chance || 0),
                block_power_base: parseFloat(body.block_power_base || 0.5),
                initiative_base: parseInt(body.initiative_base || 0),
                lifesteal_base: parseFloat(body.lifesteal_base || 0),
                cooldown_reduction: parseFloat(body.cooldown_reduction || 0),
                move_speed: parseFloat(body.move_speed || 100),
                attack_speed: parseFloat(body.attack_speed || 1.0),
                categoryId: parseInt(body.categoryId)
            },
            include: { loot: true, traits: { include: { trait: true } } }
        });

        diskMirroringSystem.writeAsset("monsters", idInt, updated);
        return updated;
    }

    async saveRegion(id, body) {
        const idInt = parseInt(id);
        const updated = await this.db.regionTemplate.upsert({
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

        diskMirroringSystem.writeAsset("regions", idInt, updated);
        return updated;
    }

    async saveItem(id, body) {
        const idInt = parseInt(id);
        const updated = await this.db.itemTemplate.upsert({
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

        diskMirroringSystem.writeAsset("items", idInt, updated);
        return updated;
    }
}

module.exports = new AssetService();
