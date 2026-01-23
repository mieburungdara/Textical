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
        
        // 1. Load Classes (Ultra Complex)
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
            } catch(e) { console.error(`Failed to load Class: ${file.fullPath}`, e.message); }
        }

        // 2. Load Traits
        const traitFiles = this._scanDir(path.join(ASSET_ROOT, 'traits'));
        for (let file of traitFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = {
                    ...data,
                    statModifiers: JSON.stringify(data.statModifiers || {}),
                    elementalMods: JSON.stringify(data.elementalMods || {}),
                    battleHooks: JSON.stringify(data.battleHooks || {}),
                    requirements: JSON.stringify(data.requirements || {}),
                    conflicts: JSON.stringify(data.conflicts || []),
                    filePath: file.relativePath
                };
                await prisma.traitTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Failed Trait: ${file.fullPath}`, e.message); }
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
            } catch(e) { console.error(`Failed Monster: ${file.fullPath}`, e.message); }
        }

        console.log(`[ASSETS] Final MASTER Sync Complete.`);
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
