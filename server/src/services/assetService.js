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
        console.log("[ASSETS] Scanning Master Files (Normalized)...");
        
        // 1. Load Item Sets & Bonuses
        const setFiles = this._scanDir(path.join(ASSET_ROOT, 'item_sets'));
        for (let file of setFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const { setBonuses, ...setData } = data;
                await prisma.itemSet.upsert({
                    where: { id: data.id },
                    update: setData,
                    create: setData
                });
                // Delete old bonuses and create new ones
                await prisma.itemSetBonus.deleteMany({ where: { setId: data.id } });
                if (setBonuses) {
                    for (let bonus of setBonuses) {
                        await prisma.itemSetBonus.create({
                            data: { setId: data.id, requiredCount: bonus.count, statModifiers: JSON.stringify(bonus.bonus) }
                        });
                    }
                }
            } catch(e) { console.error(`Set Fail: ${file.fullPath}`, e.message); }
        }

        // 2. Load Recipes & Ingredients
        const recipeFiles = this._scanDir(path.join(ASSET_ROOT, 'recipes'));
        for (let file of recipeFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const { ingredients, ...recipeData } = data;
                await prisma.recipeTemplate.upsert({
                    where: { id: data.id },
                    update: { ...recipeData, ingredients: undefined },
                    create: { ...recipeData, ingredients: undefined }
                });
                await prisma.recipeIngredient.deleteMany({ where: { recipeId: data.id } });
                if (ingredients) {
                    for (let ing of ingredients) {
                        await prisma.recipeIngredient.create({
                            data: { recipeId: data.id, itemId: ing.itemId, quantity: ing.qty }
                        });
                    }
                }
            } catch(e) { console.error(`Recipe Fail: ${file.fullPath}`, e.message); }
        }

        // 3. Load Quests & Objectives
        const questFiles = this._scanDir(path.join(ASSET_ROOT, 'quests'));
        for (let file of questFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const { objectives, ...questData } = data;
                await prisma.questTemplate.upsert({
                    where: { id: data.id },
                    update: { ...questData, objectives: undefined, logicBranches: JSON.stringify(data.logicBranches || {}), rewards: JSON.stringify(data.rewards || {}) },
                    create: { ...questData, objectives: undefined, logicBranches: JSON.stringify(data.logicBranches || {}), rewards: JSON.stringify(data.rewards || {}) }
                });
                await prisma.questObjective.deleteMany({ where: { questId: data.id } });
                if (objectives) {
                    for (let obj of objectives) {
                        await prisma.questObjective.create({
                            data: { questId: data.id, type: obj.type, targetId: obj.targetId || 0, amount: obj.amount || 1, description: obj.desc || "" }
                        });
                    }
                }
            } catch(e) { console.error(`Quest Fail: ${file.fullPath}`, e.message); }
        }

        // 4. Load remaining simple templates
        await this._loadSimpleTemplates();
        console.log(`[ASSETS] MASTER Normalization Success.`);
    }

    async _loadSimpleTemplates() {
        const configs = [
            { folder: 'traits', model: 'traitTemplate', jsonFields: ['statModifiers', 'battleHooks', 'requirements'] },
            { folder: 'classes', model: 'classTemplate', jsonFields: ['statSystem'] },
            { folder: 'jobs', model: 'jobTemplate', jsonFields: ['workStats', 'lootTable', 'toolAccess', 'masteryRewards', 'passiveBonuses'] },
            { folder: 'effects', model: 'statusEffectTemplate', jsonFields: ['tickLogic', 'statModifiers', 'battleHooks'] },
            { folder: 'buildings', model: 'buildingTemplate', jsonFields: ['upgradeTree', 'perksPerLevel', 'staffingLogic', 'maintenance'] },
            { folder: 'dialogues', model: 'dialogueTemplate', jsonFields: ['branches', 'requirements', 'triggers'] },
            { folder: 'guilds', model: 'guildTemplate', jsonFields: ['basePerks', 'progressionTree', 'creationReqs'] },
            { folder: 'achievements', model: 'achievementTemplate', jsonFields: ['requirements', 'rewards'] },
            { folder: 'events', model: 'globalEventTemplate', jsonFields: ['worldModifiers', 'combatModifiers'] }
        ];

        for (let cfg of configs) {
            const files = this._scanDir(path.join(ASSET_ROOT, cfg.folder));
            for (let file of files) {
                try {
                    const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                    const dbData = { ...data, filePath: file.relativePath };
                    cfg.jsonFields.forEach(f => dbData[f] = JSON.stringify(data[f] || (f.endsWith('s') ? [] : {})));
                    await prisma[cfg.model].upsert({ where: { id: data.id }, update: dbData, create: dbData });
                } catch(e) {}
            }
        }

        // Special load for Monsters & Items (Static IDs)
        const items = this._scanDir(path.join(ASSET_ROOT, 'items'));
        for (let file of items) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            await prisma.itemTemplate.upsert({
                where: { id: data.id },
                update: { ...data, baseStats: JSON.stringify(data.baseStats), requirements: JSON.stringify(data.requirements), allowedSockets: JSON.stringify(data.allowedSockets), salvageResult: JSON.stringify(data.salvageResult), filePath: file.relativePath },
                create: { ...data, baseStats: JSON.stringify(data.baseStats), requirements: JSON.stringify(data.requirements), allowedSockets: JSON.stringify(data.allowedSockets), salvageResult: JSON.stringify(data.salvageResult), filePath: file.relativePath }
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