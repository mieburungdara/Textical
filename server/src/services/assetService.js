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
        
        // 1. Load Quests & Rewards
        const questFiles = this._scanDir(path.join(ASSET_ROOT, 'quests'));
        for (let file of questFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const { objectives, rewards, ...questData } = data;
                
                await prisma.questTemplate.upsert({
                    where: { id: data.id },
                    update: questData,
                    create: questData
                });

                // Sync Objectives
                await prisma.questObjective.deleteMany({ where: { questId: data.id } });
                if (objectives) {
                    for (let obj of objectives) {
                        await prisma.questObjective.create({
                            data: { questId: data.id, type: obj.type, targetId: obj.targetId, amount: obj.amount || 1 }
                        });
                    }
                }

                // Sync Rewards
                await prisma.questReward.deleteMany({ where: { questId: data.id } });
                if (rewards) {
                    for (let rew of rewards) {
                        await prisma.questReward.create({
                            data: { questId: data.id, type: rew.type, targetId: rew.targetId, amount: rew.amount || 1 }
                        });
                    }
                }
            } catch(e) { console.error(`Quest Fail: ${file.fullPath}`, e.message); }
        }

        // 2. Load Items & Resources
        await this._loadItemsAndResources();
        
        // 3. Load Jobs
        const jobFiles = this._scanDir(path.join(ASSET_ROOT, 'jobs'));
        for (let file of jobFiles) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            await prisma.jobTemplate.upsert({
                where: { id: data.id },
                update: data,
                create: data
            });
        }

        console.log(`[ASSETS] MASTER Herbalist Path Success.`);
    }

    async _loadItemsAndResources() {
        const itemFiles = this._scanDir(path.join(ASSET_ROOT, 'items'));
        for (let file of itemFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const { baseStats, requirements, allowedSockets, salvageResult, ...itemData } = data;
                await prisma.itemTemplate.upsert({
                    where: { id: data.id },
                    update: { ...itemData, allowedSockets: JSON.stringify(allowedSockets || []), salvageResult: JSON.stringify(salvageResult || []) },
                    create: { ...itemData, allowedSockets: JSON.stringify(allowedSockets || []), salvageResult: JSON.stringify(salvageResult || []) }
                });
            } catch(e) {}
        }

        const regionFiles = this._scanDir(path.join(ASSET_ROOT, 'regions'));
        for (let file of regionFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const { resources, connections, ...regionData } = data;
                await prisma.regionTemplate.upsert({ where: { id: data.id }, update: regionData, create: regionData });
                await prisma.regionResource.deleteMany({ where: { regionId: data.id } });
                if (resources) {
                    for (let res of resources) {
                        await prisma.regionResource.create({
                            data: { regionId: data.id, itemId: res.itemId, spawnChance: res.spawnChance, gatherDifficulty: res.gatherDifficulty, requiredJobId: res.requiredJobId || null }
                        });
                    }
                }
            } catch(e) {}
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
