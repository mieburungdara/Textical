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
        console.log("[ASSETS] Scanning Master Files...");
        
        // 1. Load Quests (Ultra Complex)
        const questFiles = this._scanDir(path.join(ASSET_ROOT, 'quests'));
        for (let file of questFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = {
                    ...data,
                    objectives: JSON.stringify(data.objectives || []),
                    logicBranches: JSON.stringify(data.logicBranches || {}),
                    rewards: JSON.stringify(data.rewards || {}),
                    filePath: file.relativePath
                };
                await prisma.questTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Quest Load Fail: ${file.fullPath}`, e.message); }
        }

        // 2. Load Classes
        const classFiles = this._scanDir(path.join(ASSET_ROOT, 'classes'));
        for (let file of classFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = {
                    ...data,
                    statSystem: JSON.stringify(data.statSystem || {}),
                    masteries: JSON.stringify(data.masteries || {}),
                    mechanics: JSON.stringify(data.mechanics || {}),
                    skillTree: JSON.stringify(data.skillTree || []),
                    innateTraits: JSON.stringify(data.innateTraits || []),
                    promotionReqs: JSON.stringify(data.promotionReqs || {}),
                    nextClasses: JSON.stringify(data.nextClasses || []),
                    filePath: file.relativePath
                };
                await prisma.classTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Class Load Fail: ${file.fullPath}`, e.message); }
        }

        // 3. Load Monsters
        const monsterFiles = this._scanDir(path.join(ASSET_ROOT, 'monsters'));
        for (let file of monsterFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const catId = (data.categoryId || "misc").toLowerCase();
                await prisma.monsterCategory.upsert({ where: { id: catId }, update: {}, create: { id: catId, name: catId.toUpperCase() } });
                const dbData = {
                    ...data, categoryId: catId,
                    traits: JSON.stringify(data.traits || []),
                    skills: JSON.stringify(data.skills || []),
                    immunities: JSON.stringify(data.immunities || []),
                    lootTable: JSON.stringify(data.lootTable || {}),
                    filePath: file.relativePath
                };
                await prisma.monsterTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Monster Load Fail: ${file.fullPath}`, e.message); }
        }

        console.log(`[ASSETS] MASTER Sync Success.`);
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