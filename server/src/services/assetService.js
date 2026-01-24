const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const ASSET_ROOT = path.join(__dirname, '../data/assets');

class AssetService {
    constructor() {
        if (!fs.existsSync(ASSET_ROOT)) fs.mkdirSync(ASSET_ROOT, { recursive: true });
    }

    async loadAllAssets() {
        console.log("[ASSETS] Scanning Master Files (Truly Normalized)...");
        
        try {
            await this._loadPremiumTiers();
            await this._loadItemSets();
            await this._loadJobs();
            await this._loadMonsterCategories();
            await this._loadItems();
            await this._loadMonsters();
            await this._loadRegionsPass1();
            await this._loadRegionsPass2();
            await this._loadQuests();
            
            console.log(`[ASSETS] MASTER Final Relational Sync Success (Premium & Queue).`);
        } catch (err) {
            console.error("[ASSETS] CRITICAL SYNC ERROR:", err.message);
        }
    }

    async _loadPremiumTiers() {
        const tiers = [
            { id: 0, name: "Free", queueSlots: 0, speedBonus: 0.0 },
            { id: 1, name: "Bronze", queueSlots: 1, speedBonus: 0.0 },
            { id: 2, name: "Silver", queueSlots: 2, speedBonus: 0.05 },
            { id: 3, name: "Gold", queueSlots: 3, speedBonus: 0.10 },
            { id: 4, name: "Platinum", queueSlots: 5, speedBonus: 0.15 },
            { id: 5, name: "Diamond", queueSlots: 10, speedBonus: 0.25 }
        ];

        for (let tier of tiers) {
            await prisma.premiumTierTemplate.upsert({
                where: { id: tier.id },
                update: tier,
                create: tier
            });
        }
    }

    async _loadItemSets() {
        const files = this._scanDir(path.join(ASSET_ROOT, 'item_sets'));
        for (let file of files) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            await prisma.itemSet.upsert({
                where: { id: data.id },
                update: { name: data.name, description: data.description || "" },
                create: { id: data.id, name: data.name, description: data.description || "" }
            });
        }
    }

    async _loadJobs() {
        const files = this._scanDir(path.join(ASSET_ROOT, 'jobs'));
        for (let file of files) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            await prisma.jobTemplate.upsert({
                where: { id: data.id },
                update: { name: data.name, description: data.description || "", category: data.category || "COLLECTION" },
                create: { id: data.id, name: data.name, description: data.description || "", category: data.category || "COLLECTION" }
            });
        }
    }

    async _loadMonsterCategories() {
        const monsterFiles = this._scanDir(path.join(ASSET_ROOT, 'monsters'));
        for (let file of monsterFiles) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            if (data.categoryId) {
                await prisma.monsterCategory.upsert({
                    where: { id: data.categoryId },
                    update: {},
                    create: { id: data.categoryId, name: "Category " + data.categoryId }
                });
            }
        }
    }

    async _loadItems() {
        const files = this._scanDir(path.join(ASSET_ROOT, 'items'));
        for (let file of files) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            const { baseStats, requirements, allowedSockets, salvageResult, ...itemData } = data;
            await prisma.itemTemplate.upsert({
                where: { id: data.id },
                update: { ...itemData, filePath: file.relativePath },
                create: { ...itemData, filePath: file.relativePath }
            });
            await prisma.itemAllowedSocket.deleteMany({ where: { itemId: data.id } });
            if (Array.isArray(allowedSockets)) {
                for (let socketType of allowedSockets) {
                    await prisma.itemAllowedSocket.create({ data: { itemId: data.id, socketType } });
                }
            }
            await prisma.itemSalvageEntry.deleteMany({ where: { itemId: data.id } });
            if (Array.isArray(salvageResult)) {
                for (let entry of salvageResult) {
                    await prisma.itemSalvageEntry.create({ data: { itemId: data.id, materialId: entry.itemId, quantity: entry.qty || 1 } });
                }
            }
            await prisma.itemStat.deleteMany({ where: { itemId: data.id } });
            if (baseStats) {
                for (let [key, val] of Object.entries(baseStats)) {
                    await prisma.itemStat.create({ data: { itemId: data.id, statKey: key, statValue: parseFloat(val) } });
                }
            }
        }
    }

    async _loadMonsters() {
        const files = this._scanDir(path.join(ASSET_ROOT, 'monsters'));
        for (let file of files) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            await prisma.monsterTemplate.upsert({
                where: { id: data.id },
                update: { name: data.name, categoryId: data.categoryId, hp_base: data.hp_base, damage_base: data.damage_base, filePath: file.relativePath },
                create: { id: data.id, name: data.name, categoryId: data.categoryId, hp_base: data.hp_base, damage_base: data.damage_base, filePath: file.relativePath }
            });
        }
    }

    async _loadRegionsPass1() {
        const files = this._scanDir(path.join(ASSET_ROOT, 'regions'));
        for (let file of files) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            const { resources, connections, ...regionData } = data;
            await prisma.regionTemplate.upsert({
                where: { id: data.id },
                update: { ...regionData, filePath: file.relativePath },
                create: { ...regionData, filePath: file.relativePath }
            });
        }
    }

    async _loadRegionsPass2() {
        const files = this._scanDir(path.join(ASSET_ROOT, 'regions'));
        for (let file of files) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            const { resources, connections } = data;
            await prisma.regionResource.deleteMany({ where: { regionId: data.id } });
            if (resources) {
                for (let res of resources) {
                    await prisma.regionResource.create({
                        data: { regionId: data.id, itemId: res.itemId, spawnChance: res.spawnChance, gatherDifficulty: res.gatherDifficulty, gatherTimeSeconds: res.gatherTimeSeconds || 10, requiredJobId: res.requiredJobId || null }
                    });
                }
            }
            await prisma.regionConnection.deleteMany({ where: { originRegionId: data.id } });
            if (connections) {
                for (let conn of connections) {
                    await prisma.regionConnection.create({
                        data: { originRegionId: data.id, targetRegionId: conn.targetRegionId, travelTimeSeconds: conn.travelTimeSeconds || 10 }
                    });
                }
            }
        }
    }

    async _loadQuests() {
        const files = this._scanDir(path.join(ASSET_ROOT, 'quests'));
        for (let file of files) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            const { objectives, rewards, ...questData } = data;
            await prisma.questTemplate.upsert({ where: { id: data.id }, update: { ...questData, filePath: file.relativePath }, create: { ...questData, filePath: file.relativePath } });
            await prisma.questObjective.deleteMany({ where: { questId: data.id } });
            if (objectives) {
                for (let obj of objectives) {
                    await prisma.questObjective.create({
                        data: { questId: data.id, type: obj.type, targetId: obj.targetId, amount: obj.amount || 1, description: obj.description || "" }
                    });
                }
            }
            await prisma.questReward.deleteMany({ where: { questId: data.id } });
            if (rewards) {
                for (let rew of rewards) {
                    await prisma.questReward.create({
                        data: { questId: data.id, type: rew.type, targetId: rew.targetId, amount: rew.amount || 1 }
                    });
                }
            }
        }
    }

    _scanDir(dir, fileList = [], rootDir = dir) {
        if (!fs.existsSync(dir)) return [];
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) this._scanDir(filePath, fileList, rootDir);
            else if (file.endsWith('.json')) {
                const relative = path.relative(rootDir, filePath).split(path.sep).join('/');
                fileList.push({ fullPath: filePath, relativePath: relative });
            }
        });
        return fileList;
    }
}

module.exports = new AssetService();
