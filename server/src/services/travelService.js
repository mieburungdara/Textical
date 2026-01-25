const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const vitalityService = require('./vitalityService');

/**
 * TravelService
 * Handles movement between Regions.
 * Enforces the 15-second travel time and Vitality costs.
 */
class TravelService {
    constructor() {
        this.BASE_TRAVEL_VITALITY_COST = 5;
    }

    /**
     * Starts a travel task from the current region to a target region.
     */
    async startTravel(userId, targetRegionId) {
        // 1. Fetch User and Current Region
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });

        if (!user) throw new Error("User not found");
        if (user.taskQueue.length > 0) throw new Error("User is already performing a task.");
        if (user.currentRegion === targetRegionId) throw new Error("You are already in this region.");

        // 2. Verify Connection (Origin -> Target)
        const connection = await prisma.regionConnection.findFirst({
            where: {
                originRegionId: user.currentRegion,
                targetRegionId: targetRegionId
            }
        });

        if (!connection) throw new Error("No direct path exists between these regions.");

        // 3. Consume Vitality
        await vitalityService.consumeVitality(userId, this.BASE_TRAVEL_VITALITY_COST);

        // 4. Create Travel Task in Queue
        const now = new Date();
        const duration = Math.min(connection.travelTimeSeconds, 5); // CAP at 5s for dev
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

    /**
     * Finalizes the travel task, updating the user's location.
     */
    async completeTravel(userId, taskId) {
        const task = await prisma.taskQueue.findUnique({
            where: { id: taskId }
        });

        if (!task || task.userId !== userId || task.type !== "TRAVEL") {
            throw new Error("Invalid travel task.");
        }

        if (new Date() < new Date(task.finishesAt)) {
            throw new Error("Travel is still in progress.");
        }

        // Atomic Update: Set User Location + Mark Task Completed
        return await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { currentRegion: task.targetRegionId }
            }),
            prisma.taskQueue.update({
                where: { id: taskId },
                data: { status: "COMPLETED" }
            })
        ]);
    }

    /**
     * Helper to get active travel status.
     */
    async getActiveTravel(userId) {
        return await prisma.taskQueue.findFirst({
            where: {
                userId: userId,
                type: "TRAVEL",
                status: "RUNNING"
            },
            include: {
                originRegion: true,
                targetRegion: true
            }
        });
    }
}

module.exports = new TravelService();
