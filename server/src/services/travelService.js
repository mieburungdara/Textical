const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const vitalityService = require('./vitalityService');

class TravelService {
    constructor() {
        this.BASE_TRAVEL_VITALITY_COST = 5;
    }

    async startTravel(userIdRaw, targetRegionIdRaw) {
        // BUG FIX: Cast to Integer to prevent Floating Point ID Corruption from JSON
        const userId = parseInt(userIdRaw);
        const targetRegionId = parseInt(targetRegionIdRaw);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });

        if (!user) throw new Error("User not found");
        if (user.taskQueue.length > 0) throw new Error("User is busy with another task.");
        if (user.currentRegion === targetRegionId) throw new Error("You are already there.");

        const connection = await prisma.regionConnection.findFirst({
            where: { originRegionId: user.currentRegion, targetRegionId: targetRegionId }
        });

        if (!connection) throw new Error("No direct path exists.");

        // Authoritative Check: Sync Vitality before consuming
        await vitalityService.syncUserVitality(userId);
        const freshUser = await prisma.user.findUnique({ where: { id: userId } });
        if (freshUser.vitality < this.BASE_TRAVEL_VITALITY_COST) throw new Error("Not enough Vitality.");

        const now = new Date();
        const duration = 5; 
        const finishesAt = new Date(now.getTime() + (duration * 1000));

        // BUG FIX: Use Transaction to ensure Region Update and Task Lock are atomic (Zero Overlap)
        return await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { 
                    currentRegion: targetRegionId,
                    vitality: { decrement: this.BASE_TRAVEL_VITALITY_COST }
                }
            }),
            prisma.taskQueue.create({
                data: {
                    userId: userId,
                    type: "TRAVEL",
                    originRegionId: user.currentRegion,
                    targetRegionId: targetRegionId,
                    status: "RUNNING",
                    startedAt: now,
                    finishesAt: finishesAt
                }
            })
        ]);
    }

    async completeTravel(_userId, taskId) {
        return await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: "COMPLETED" }
        });
    }
}

module.exports = new TravelService();
