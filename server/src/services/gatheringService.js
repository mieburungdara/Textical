const prisma = require('../db');
const vitalityService = require('./vitalityService');
const inventoryService = require('./inventoryService');
const statService = require('./statService');

class GatheringService {
    constructor() {
        this.BASE_GATHER_VITALITY_COST = 3;
    }

    async startGathering(userId, heroId, regionResourceId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });

        const hero = await prisma.hero.findUnique({ where: { id: heroId } });
        const resource = await prisma.regionResource.findUnique({
            where: { id: regionResourceId },
            include: { item: true }
        });

        if (!user || !hero || !resource) throw new Error("Invalid parameters.");
        if (hero.userId !== userId) throw new Error("You do not own this hero.");
        if (user.currentRegion !== resource.regionId) throw new Error("Incorrect region.");
        if (user.taskQueue.length > 0) throw new Error("Busy.");

        const hasSpace = await inventoryService.hasSpace(userId, resource.itemId);
        if (!hasSpace) throw new Error("Inventory full.");

        // --- AAA SPECIALIZED MINING LOGIC ---
        // Calculate dynamic duration based on Hero STR and Item Hardness
        const heroStats = await statService.calculateHeroStats(heroId);
        const str = heroStats.attributes.str || 10;
        const hardness = resource.item.hardness || 1;
        const minStr = resource.item.minStr || 0;
        const minToolTier = resource.item.minToolTier || 0;

        // 1. Physical Requirement Check
        if (str < minStr) {
            throw new Error(`Hero is not strong enough to mine this material. (Required: ${minStr} STR, Have: ${str} STR)`);
        }

        // 2. Tool Tier Check
        const heroData = await prisma.hero.findUnique({
            where: { id: heroId },
            include: { equipment: { include: { itemInstance: { include: { template: true } } } } }
        });

        // Categorize based on Target Material ID range
        const isWood = resource.itemId >= 2400 && resource.itemId < 2500;
        const isPlant = resource.itemId >= 2800 && resource.itemId < 2900;
        const isFish = resource.itemId >= 3300 && resource.itemId < 3400;
        
        if (isPlant || isFish) {
            // Herbalism (INT) or Fishing (DEX) requires no special tool but scales with specific stat
            const statValue = isPlant ? heroData.int : heroData.dex;
            const duration = Math.ceil(resource.gatherTimeSeconds / Math.max(0.5, statValue / 10));
            const now = new Date();
            const finishesAt = new Date(now.getTime() + (duration * 1000));

            return await prisma.taskQueue.create({
                data: {
                    userId, heroId, type: "GATHERING", targetItemId: resource.itemId,
                    status: "RUNNING", startedAt: now, finishesAt: finishesAt
                }
            });
        }

        const requiredCategory = isWood ? "AXE" : "PICKAXE";

        const equippedTool = heroData.equipment.find(eq => eq.itemInstance.template.category === requiredCategory);
        const currentToolTier = equippedTool ? (equippedTool.itemInstance.template.toolTier || 0) : -1;

        if (currentToolTier < minToolTier) {
            const toolName = requiredCategory === "AXE" ? "axe" : "pickaxe";
            const toolMsg = minToolTier === 0 ? `a basic ${toolName}` : `a Tier ${minToolTier} ${toolName}`;
            throw new Error(`You need ${toolMsg} to harvest this material. (Current Tier: ${currentToolTier === -1 ? 'None' : currentToolTier})`);
        }
        
        // 3. Duration Logic
        const strFactor = Math.max(0.5, str / 10);
        let duration = Math.ceil((resource.gatherTimeSeconds * hardness) / strFactor);
        
        // Cap duration to realistic limits
        duration = Math.max(5, Math.min(3600, duration)); 

        await vitalityService.consumeVitality(userId, this.BASE_GATHER_VITALITY_COST);

        const now = new Date();
        const finishesAt = new Date(now.getTime() + (duration * 1000));

        return await prisma.taskQueue.create({
            data: {
                userId, heroId, type: "GATHERING", targetItemId: resource.itemId,
                status: "RUNNING", startedAt: now, finishesAt: finishesAt
            }
        });
    }

    async completeGathering(userId, taskId) {
        const task = await prisma.taskQueue.findUnique({ where: { id: taskId } });
        if (!task || task.status !== "RUNNING") return;

        await inventoryService.addItem(userId, task.targetItemId, 1);

        return await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: "COMPLETED" }
        });
    }
}

module.exports = new GatheringService();
