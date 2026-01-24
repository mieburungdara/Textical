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
            await this._loadItemSets();
            await this._loadJobs();
            await this._loadMonsterCategories();
            await this._loadItems();
            await this._loadMonsters();
            await this._loadRegions();
            await this._loadQuests();
            
            console.log(`[ASSETS] MASTER Advanced Systems Sync Success.`);
        } catch (err) {
            console.error("[ASSETS] CRITICAL SYNC ERROR:", err.message);
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

            // 1. Sockets (Junction)
            await prisma.itemAllowedSocket.deleteMany({ where: { itemId: data.id } });
            if (Array.isArray(allowedSockets)) {
                for (let socketType of allowedSockets) {
                    await prisma.itemAllowedSocket.create({ data: { itemId: data.id, socketType } });
                }
            }

            // 2. Salvage (Junction)
            await prisma.itemSalvageEntry.deleteMany({ where: { itemId: data.id } });
            if (Array.isArray(salvageResult)) {
                for (let entry of salvageResult) {
                    await prisma.itemSalvageEntry.create({ data: { itemId: data.id, materialId: entry.itemId, quantity: entry.qty || 1 } });
                }
            }

            // 3. Stats (Junction)
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

    async _loadRegions() {
        const files = this._scanDir(path.join(ASSET_ROOT, 'regions'));
        for (let file of files) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            const { resources, connections, ...regionData } = data;
            await prisma.regionTemplate.upsert({ where: { id: data.id }, update: { ...regionData, filePath: file.relativePath }, create: { ...regionData, filePath: file.relativePath } });
            
            await prisma.regionResource.deleteMany({ where: { regionId: data.id } });
            if (resources) {
                for (let res of resources) {
                    await prisma.regionResource.create({
                        data: { regionId: data.id, itemId: res.itemId, spawnChance: res.spawnChance, gatherDifficulty: res.gatherDifficulty, requiredJobId: res.requiredJobId || null }
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

    async _loadOthers() {}

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