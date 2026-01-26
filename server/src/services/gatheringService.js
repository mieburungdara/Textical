const prisma = require('../db');

const vitalityService = require('./vitalityService');
const inventoryService = require('./inventoryService');

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

        // Unified Slot Check
        const hasSpace = await inventoryService.hasSpace(userId, resource.itemId);
        if (!hasSpace) throw new Error("Inventory full.");

        await vitalityService.consumeVitality(userId, this.BASE_GATHER_VITALITY_COST);

        const now = new Date();
        const finishesAt = new Date(now.getTime() + (resource.gatherTimeSeconds * 1000));

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

        // Unified Item Addition
        await inventoryService.addItem(userId, task.targetItemId, 1);

        return await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: "COMPLETED" }
        });
    }
}

module.exports = new GatheringService();