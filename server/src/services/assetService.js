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
        
        // 1. Load Item Sets (IMPORTANT: Must load BEFORE items)
        const setFiles = this._scanDir(path.join(ASSET_ROOT, 'item_sets'));
        for (let file of setFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                await prisma.itemSet.upsert({
                    where: { id: data.id },
                    update: { ...data, setBonuses: JSON.stringify(data.setBonuses || []) },
                    create: { ...data, setBonuses: JSON.stringify(data.setBonuses || []) }
                });
            } catch(e) { console.error(`Set Fail: ${file.fullPath}`, e.message); }
        }

        // 2. Load Items
        const itemFiles = this._scanDir(path.join(ASSET_ROOT, 'items'));
        for (let file of itemFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const dbData = {
                    ...data,
                    baseStats: JSON.stringify(data.baseStats || {}),
                    requirements: JSON.stringify(data.requirements || {}),
                    allowedSockets: JSON.stringify(data.allowedSockets || []),
                    salvageResult: JSON.stringify(data.salvageResult || []),
                    filePath: file.relativePath
                };
                await prisma.itemTemplate.upsert({ where: { id: data.id }, update: dbData, create: dbData });
            } catch(e) { console.error(`Item Fail: ${file.fullPath}`, e.message); }
        }

        // 3. Load Recipes, Achievements, Dialogues, Buildings, Guilds, etc.
        await this._loadCommonAssets();
        console.log(`[ASSETS] Final MASTER Sync Success.`);
    }

    async _loadCommonAssets() {
        const categories = [
            { folder: 'recipes', model: 'recipeTemplate', jsonFields: ['ingredients'] },
            { folder: 'achievements', model: 'achievementTemplate', jsonFields: ['requirements', 'rewards'] },
            { folder: 'events', model: 'globalEventTemplate', jsonFields: ['worldModifiers', 'combatModifiers', 'specialSpawns'] },
            { folder: 'quests', model: 'questTemplate', jsonFields: ['objectives', 'logicBranches', 'rewards'] },
            { folder: 'traits', model: 'traitTemplate', jsonFields: ['statModifiers', 'elementalMods', 'battleHooks', 'requirements', 'conflicts'] },
            { folder: 'classes', model: 'classTemplate', jsonFields: ['statSystem', 'masteries', 'mechanics', 'skillTree', 'innateTraits', 'promotionReqs', 'nextClasses'] },
            { folder: 'jobs', model: 'jobTemplate', jsonFields: ['workStats', 'lootTable', 'toolAccess', 'masteryRewards', 'passiveBonuses'] },
            { folder: 'effects', model: 'statusEffectTemplate', jsonFields: ['tickLogic', 'statModifiers', 'battleHooks'] },
            { folder: 'dialogues', model: 'dialogueTemplate', jsonFields: ['branches', 'requirements', 'triggers'] },
            { folder: 'buildings', model: 'buildingTemplate', jsonFields: ['upgradeTree', 'perksPerLevel', 'staffingLogic', 'maintenance'] }
        ];

        for (let cat of categories) {
            const files = this._scanDir(path.join(ASSET_ROOT, cat.folder));
            for (let file of files) {
                try {
                    const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                    const dbData = { ...data, filePath: file.relativePath };
                    cat.jsonFields.forEach(f => dbData[f] = JSON.stringify(data[f] || (f.endsWith('s') ? [] : {})));
                    await prisma[cat.model].upsert({ where: { id: data.id }, update: dbData, create: dbData });
                } catch(e) {}
            }
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
