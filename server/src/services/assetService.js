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
        
        // 1. Load Quests & Objectives
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

                await prisma.questObjective.deleteMany({ where: { questId: data.id } });
                if (objectives) {
                    for (let obj of objectives) {
                        await prisma.questObjective.create({
                            data: { 
                                questId: data.id, 
                                type: obj.type, 
                                targetId: obj.targetId, 
                                amount: obj.amount || 1,
                                description: obj.desc || "" // FIXED: Included description
                            }
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
            } catch(e) { console.error(`Quest Fail: ${file.fullPath}`, e.message); }
        }

        // 2. Load other templates (Items, Regions, etc.)
        await this._loadCommonTemplates();
        console.log(`[ASSETS] MASTER Restored Sync Success.`);
    }

    async _loadCommonTemplates() {
        // Shared logic for simple models... (Monster, Class, Job, etc.)
        const jobFiles = this._scanDir(path.join(ASSET_ROOT, 'jobs'));
        for (let file of jobFiles) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            await prisma.jobTemplate.upsert({ where: { id: data.id }, update: data, create: data });
        }
        
        const itemFiles = this._scanDir(path.join(ASSET_ROOT, 'items'));
        for (let file of itemFiles) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            const { baseStats, requirements, allowedSockets, salvageResult, ...itemData } = data;
            await prisma.itemTemplate.upsert({
                where: { id: data.id },
                update: { ...itemData, allowedSockets: JSON.stringify(allowedSockets || []), salvageResult: JSON.stringify(salvageResult || []) },
                create: { ...itemData, allowedSockets: JSON.stringify(allowedSockets || []), salvageResult: JSON.stringify(salvageResult || []) }
            });
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