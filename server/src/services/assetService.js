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
        
        // 1. Load Item Sets first
        const setFiles = this._scanDir(path.join(ASSET_ROOT, 'item_sets'));
        for (let file of setFiles) {
            const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
            await prisma.itemSet.upsert({
                where: { id: data.id },
                update: { name: data.name, description: data.description },
                create: { id: data.id, name: data.name, description: data.description }
            });
        }

        // 2. Load Items
        const itemFiles = this._scanDir(path.join(ASSET_ROOT, 'items'));
        for (let file of itemFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const { baseStats, requirements, allowedSockets, salvageResult, setId, ...itemData } = data;
                
                const dbData = {
                    ...itemData,
                    setId: setId || null,
                    allowedSockets: JSON.stringify(allowedSockets || []),
                    salvageResult: JSON.stringify(salvageResult || []),
                    filePath: file.relativePath
                };

                await prisma.itemTemplate.upsert({
                    where: { id: data.id },
                    update: dbData,
                    create: dbData
                });

                // Sync Detail Tables
                await prisma.itemStat.deleteMany({ where: { itemId: data.id } });
                if (baseStats) {
                    for (let [key, val] of Object.entries(baseStats)) {
                        await prisma.itemStat.create({ data: { itemId: data.id, statKey: key, statValue: parseFloat(val) } });
                    }
                }
            } catch(e) { console.error(`Item Fail: ${file.fullPath}`, e.message); }
        }

        // 3. Load Regions
        const regionFiles = this._scanDir(path.join(ASSET_ROOT, 'regions'));
        for (let file of regionFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(file.fullPath, 'utf-8'));
                const { resources, connections, ...regionData } = data;
                await prisma.regionTemplate.upsert({
                    where: { id: data.id },
                    update: regionData,
                    create: regionData
                });
                await prisma.regionResource.deleteMany({ where: { regionId: data.id } });
                if (resources) {
                    for (let res of resources) {
                        await prisma.regionResource.create({
                            data: { regionId: data.id, itemId: res.itemId, spawnChance: res.spawnChance, gatherDifficulty: res.gatherDifficulty }
                        });
                    }
                }
            } catch(e) { console.error(`Region Fail: ${file.fullPath}`, e.message); }
        }

        console.log(`[ASSETS] MASTER Botanical Sync Success.`);
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