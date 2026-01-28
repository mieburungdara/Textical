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

        await vitalityService.syncUserVitality(userId);
        const freshUser = await prisma.user.findUnique({ where: { id: userId } });
        if (freshUser.vitality < this.BASE_TRAVEL_VITALITY_COST) throw new Error("Not enough Vitality.");

        const now = new Date();
        const duration = connection.travelTimeSeconds || 15; 
        const finishesAt = new Date(now.getTime() + (duration * 1000));

        // Start Journey: Deduct Vitality & Create Task (DO NOT update currentRegion yet)
        const operations = [
            prisma.user.update({
                where: { id: userId },
                data: { 
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
                },
                include: { targetRegion: true } 
            })
        ];

        const result = await prisma.$transaction(operations);
        const task = result[1];
        return { ...task, targetRegionType: task.targetRegion ? task.targetRegion.visualType : "TOWN" };
    }

    async completeTravel(userId, taskId) {
        const task = await prisma.taskQueue.findUnique({
            where: { id: taskId }
        });

        if (!task || task.status !== "RUNNING") return;

        // Atomic Arrive: Update User Region and Complete Task
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
}

module.exports = new TravelService();