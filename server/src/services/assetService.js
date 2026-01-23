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
        
        // 1. Load Dialogues (NEW)
        const dialogueFiles = this._scanDir(path.join(ASSET_ROOT, 'dialogues'));
        for (let file of dialogueFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = {
                    ...data,
                    branches: JSON.stringify(data.branches || []),
                    requirements: JSON.stringify(data.requirements || {}),
                    triggers: JSON.stringify(data.triggers || []),
                    filePath: file.relativePath
                };
                await prisma.dialogueTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Dialogue Load Fail: ${file.fullPath}`, e.message); }
        }

        // 2. Load Buildings
        const buildingFiles = this._scanDir(path.join(ASSET_ROOT, 'buildings'));
        for (let file of buildingFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = {
                    ...data,
                    upgradeTree: JSON.stringify(data.upgradeTree || []),
                    perksPerLevel: JSON.stringify(data.perksPerLevel || []),
                    staffingLogic: JSON.stringify(data.staffingLogic || {}),
                    maintenance: JSON.stringify(data.maintenance || {}),
                    filePath: file.relativePath
                };
                await prisma.buildingTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Building Load Fail: ${file.fullPath}`, e.message); }
        }

        // 3. Load Guilds
        const guildFiles = this._scanDir(path.join(ASSET_ROOT, 'guilds'));
        for (let file of guildFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = { ...data, basePerks: JSON.stringify(data.basePerks || {}), progressionTree: JSON.stringify(data.progressionTree || []), creationReqs: JSON.stringify(data.creationReqs || {}), filePath: file.relativePath };
                await prisma.guildTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Guild Fail: ${file.fullPath}`, e.message); }
        }

        // 4. Load Events, Quests, Classes, Monsters (Remaining logic)
        const otherFiles = [
            { folder: 'events', model: 'globalEventTemplate', fields: ['worldModifiers', 'combatModifiers', 'specialSpawns'] },
            { folder: 'quests', model: 'questTemplate', fields: ['objectives', 'logicBranches', 'rewards'] },
            { folder: 'traits', model: 'traitTemplate', fields: ['statModifiers', 'elementalMods', 'battleHooks', 'requirements', 'conflicts'] }
        ];

        for (let category of otherFiles) {
            const files = this._scanDir(path.join(ASSET_ROOT, category.folder));
            for (let file of files) {
                try {
                    const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                    const dbData = { ...data, filePath: file.relativePath };
                    category.fields.forEach(f => dbData[f] = JSON.stringify(data[f] || (f.endsWith('s') ? [] : {})));
                    await prisma[category.model].upsert({ where: { id: data.id }, update: dbData, create: dbData });
                } catch(e) { console.error(`${category.folder} Fail: ${file.fullPath}`, e.message); }
            }
        }

        // Specific handling for Classes (statSystem, masteries, etc.)
        const classFiles = this._scanDir(path.join(ASSET_ROOT, 'classes'));
        for (let file of classFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = { ...data, statSystem: JSON.stringify(data.statSystem || {}), masteries: JSON.stringify(data.masteries || {}), mechanics: JSON.stringify(data.mechanics || {}), skillTree: JSON.stringify(data.skillTree || []), innateTraits: JSON.stringify(data.innateTraits || []), promotionReqs: JSON.stringify(data.promotionReqs || {}), nextClasses: JSON.stringify(data.nextClasses || []), filePath: file.relativePath };
                await prisma.classTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Class Fail: ${file.fullPath}`, e.message); }
        }

        // Monsters
        const monsterFiles = this._scanDir(path.join(ASSET_ROOT, 'monsters'));
        for (let file of monsterFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const catId = (data.categoryId || "misc").toLowerCase();
                await prisma.monsterCategory.upsert({ where: { id: catId }, update: {}, create: { id: catId, name: catId.toUpperCase() } });
                const dbData = { ...data, categoryId: catId, traits: JSON.stringify(data.traits || []), skills: JSON.stringify(data.skills || []), immunities: JSON.stringify(data.immunities || []), lootTable: JSON.stringify(data.lootTable || {}), filePath: file.relativePath };
                await prisma.monsterTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Monster Fail: ${file.fullPath}`, e.message); }
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
