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
        
        const totalActiveTasks = await prisma.taskQueue.count({
            where: { userId, status: { in: ["RUNNING", "PENDING"] } }
        });

        if (totalActiveTasks > 0) {
            throw new Error("You cannot start a journey while busy with other actions.");
        }

        const connection = await prisma.regionConnection.findFirst({
            where: { originRegionId: user.currentRegion, targetRegionId: targetRegionId }
        });

        if (!connection) throw new Error("No direct path exists from here.");

        // Fetch Target Region Template to return metadata to client
        const targetRegion = await prisma.regionTemplate.findUnique({ where: { id: targetRegionId } });

        await vitalityService.syncUserVitality(userId);
        const freshUser = await prisma.user.findUnique({ where: { id: userId } });
        if (freshUser.vitality < this.BASE_TRAVEL_VITALITY_COST) throw new Error("Not enough Vitality.");

        const now = new Date();
        const duration = 5; 
        const finishesAt = new Date(now.getTime() + (duration * 1000));

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
                    status: "RUNNING",
                    startedAt: now,
                    finishesAt: finishesAt
                },
                include: { targetRegion: true } // Ensure full metadata is included
            })
        ];

        const result = await prisma.$transaction(operations);
        return result[1]; // Return the created Task with targetRegion included
    }

    async completeTravel(_userId, taskId) {
        return await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: "COMPLETED" }
        });
    }
}

module.exports = new TravelService();