const prisma = require('../db');
const vitalityService = require('./vitalityService');

class TravelService {
    constructor() {
        this.BASE_TRAVEL_VITALITY_COST = 5;
    }

    async startTravel(userIdRaw, targetRegionIdRaw) {
        const userId = parseInt(userIdRaw);
        const targetRegionId = parseInt(targetRegionIdRaw);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { 
                taskQueue: {
                    where: { status: { in: ["RUNNING", "PENDING"] } },
                    orderBy: { id: 'desc' },
                    take: 1
                },
                premiumTier: true 
            }
        });

        if (!user) throw new Error("User not found");
        
        // BUG FIX: Disable Queuing for Travel
        // Travel can only be started if there are ZERO running or pending tasks
        const totalActiveTasks = await prisma.taskQueue.count({
            where: { userId, status: { in: ["RUNNING", "PENDING"] } }
        });

        if (totalActiveTasks > 0) {
            throw new Error("You cannot start a journey while busy with other actions.");
        }

        // Adjacency check (Always from current location)
        const connection = await prisma.regionConnection.findFirst({
            where: { originRegionId: user.currentRegion, targetRegionId: targetRegionId }
        });

        if (!connection) throw new Error("No direct path exists from here.");

        // Authoritative Vitality Sync
        await vitalityService.syncUserVitality(userId);
        const freshUser = await prisma.user.findUnique({ where: { id: userId } });
        if (freshUser.vitality < this.BASE_TRAVEL_VITALITY_COST) throw new Error("Not enough Vitality.");

        const now = new Date();
        const duration = 5; 
        const finishesAt = new Date(now.getTime() + (duration * 1000));

        // TRAVEL is always the FIRST and ONLY task
        const operations = [
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
                    targetRegionId: targetRegionId,
                    status: "RUNNING", // Always RUNNING
                    startedAt: now,
                    finishesAt: finishesAt
                }
            })
        ];

        return await prisma.$transaction(operations);
    }

    async completeTravel(_userId, taskId) {
        return await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: "COMPLETED" }
        });
    }
}

module.exports = new TravelService();
