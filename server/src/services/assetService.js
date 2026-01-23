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
        
        // 1. Load Status Effects (NEW)
        const effectFiles = this._scanDir(path.join(ASSET_ROOT, 'effects'));
        for (let file of effectFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = {
                    ...data,
                    tickLogic: JSON.stringify(data.tickLogic || {}),
                    statModifiers: JSON.stringify(data.statModifiers || {}),
                    battleHooks: JSON.stringify(data.battleHooks || {}),
                    filePath: file.relativePath
                };
                await prisma.statusEffectTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Effect Fail: ${file.fullPath}`, e.message); }
        }

        // 2. Load Dialogues
        const dialogueFiles = this._scanDir(path.join(ASSET_ROOT, 'dialogues'));
        for (let file of dialogueFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = { ...data, branches: JSON.stringify(data.branches || []), requirements: JSON.stringify(data.requirements || {}), triggers: JSON.stringify(data.triggers || []), filePath: file.relativePath };
                await prisma.dialogueTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Dialogue Fail: ${file.fullPath}`, e.message); }
        }

        // 3. Load Buildings
        const buildingFiles = this._scanDir(path.join(ASSET_ROOT, 'buildings'));
        for (let file of buildingFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = { ...data, upgradeTree: JSON.stringify(data.upgradeTree || []), perksPerLevel: JSON.stringify(data.perksPerLevel || []), staffingLogic: JSON.stringify(data.staffingLogic || {}), maintenance: JSON.stringify(data.maintenance || {}), filePath: file.relativePath };
                await prisma.buildingTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Building Fail: ${file.fullPath}`, e.message); }
        }

        // 4. Load remaining types (Guilds, Events, Quests, Traits, Classes, Monsters)
        const categories = [
            { folder: 'guilds', model: 'guildTemplate', jsonFields: ['basePerks', 'progressionTree', 'creationReqs'] },
            { folder: 'events', model: 'globalEventTemplate', jsonFields: ['worldModifiers', 'combatModifiers', 'specialSpawns'] },
            { folder: 'quests', model: 'questTemplate', jsonFields: ['objectives', 'logicBranches', 'rewards'] },
            { folder: 'traits', model: 'traitTemplate', jsonFields: ['statModifiers', 'elementalMods', 'battleHooks', 'requirements', 'conflicts'] },
            { folder: 'classes', model: 'classTemplate', jsonFields: ['statSystem', 'masteries', 'mechanics', 'skillTree', 'innateTraits', 'promotionReqs', 'nextClasses'] }
        ];

        for (let cat of categories) {
            const files = this._scanDir(path.join(ASSET_ROOT, cat.folder));
            for (let file of files) {
                try {
                    const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                    const dbData = { ...data, filePath: file.relativePath };
                    cat.jsonFields.forEach(f => dbData[f] = JSON.stringify(data[f] || (f.endsWith('s') ? [] : {})));
                    await prisma[cat.model].upsert({ where: { id: data.id }, update: dbData, create: dbData });
                } catch(e) { console.error(`${cat.folder} Fail: ${file.fullPath}`, e.message); }
            }
        }

        // Monsters (Special relational handling)
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