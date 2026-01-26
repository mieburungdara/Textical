const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const vitalityService = require('./vitalityService');

class TravelService {
    constructor() {
        this.BASE_TRAVEL_VITALITY_COST = 5;
    }

    async startTravel(userIdRaw, targetRegionIdRaw) {
        const userId = parseInt(userIdRaw);
        const targetRegionId = parseInt(targetRegionIdRaw);

        // 1. Fetch User with Lock-Aware check
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });

        if (!user) throw new Error("User not found");
        if (user.taskQueue.length > 0) throw new Error("User is busy.");
        if (user.currentRegion === targetRegionId) throw new Error("Already there.");

        // 2. CONNECTION VERIFICATION (Strict check)
        const connection = await prisma.regionConnection.findFirst({
            where: { originRegionId: user.currentRegion, targetRegionId: targetRegionId }
        });

        if (!connection) throw new Error("No direct path exists.");

        // 3. Vitality Guard
        await vitalityService.syncUserVitality(userId);
        const freshUser = await prisma.user.findUnique({ where: { id: userId } });
        if (freshUser.vitality < this.BASE_TRAVEL_VITALITY_COST) throw new Error("Insufficient Vitality.");

        const now = new Date();
        const finishesAt = new Date(now.getTime() + (5 * 1000)); // 5s for dev

        // BUG FIX: Wrap everything in a single transaction
        // Ensure isInTavern is reset and location is updated ATOMICALLY with the lock
        return await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { 
                    currentRegion: targetRegionId,
                    vitality: { decrement: this.BASE_TRAVEL_VITALITY_COST },
                    isInTavern: false,
                    tavernEntryAt: null
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
