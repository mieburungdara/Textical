const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const vitalityService = require('./vitalityService');

/**
 * TravelService
 * Handles movement between Regions.
 * Implements Instant Migration with a 5-second Visual/Action lock.
 */
class TravelService {
    constructor() {
        this.BASE_TRAVEL_VITALITY_COST = 5;
    }

    async startTravel(userId, targetRegionId) {
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

        // 1. Consume Vitality
        await vitalityService.consumeVitality(userId, this.BASE_TRAVEL_VITALITY_COST);

        // 2. INSTANT MIGRATION: Update region in DB immediately
        await prisma.user.update({
            where: { id: userId },
            data: { currentRegion: targetRegionId }
        });

        // 3. Create Action Lock (5s)
        const now = new Date();
        const duration = 5; // Fixed 5s for transition
        const finishesAt = new Date(now.getTime() + (duration * 1000));

        return await prisma.taskQueue.create({
            data: {
                userId: userId,
                type: "TRAVEL",
                originRegionId: user.currentRegion,
                targetRegionId: targetRegionId,
                status: "RUNNING",
                startedAt: now,
                finishesAt: finishesAt
            }
        });
    }

    async completeTravel(_userId, taskId) {
        // Since region is already updated, we just close the task to release the lock
        return await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: "COMPLETED" }
        });
    }
}

module.exports = new TravelService();