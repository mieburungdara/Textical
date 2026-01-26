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
        
        const activeTask = user.taskQueue.length > 0 ? user.taskQueue[0] : null;
        const activeCount = await prisma.taskQueue.count({
            where: { userId, status: { in: ["RUNNING", "PENDING"] } }
        });

        if (activeCount >= user.premiumTier.queueSlots) {
            throw new Error(`Queue full (${activeCount}/${user.premiumTier.queueSlots} slots).`);
        }

        let originId = user.currentRegion;
        if (activeTask) {
            originId = activeTask.targetRegionId || user.currentRegion;
        }

        if (originId === targetRegionId) throw new Error("You are already traveling to this destination.");

        const connection = await prisma.regionConnection.findFirst({
            where: { originRegionId: originId, targetRegionId: targetRegionId }
        });

        if (!connection) throw new Error(`No direct path exists from ${activeTask ? "previous destination" : "here"}.`);

        await vitalityService.syncUserVitality(userId);
        const freshUser = await prisma.user.findUnique({ where: { id: userId } });
        if (freshUser.vitality < this.BASE_TRAVEL_VITALITY_COST) throw new Error("Not enough Vitality.");

        const isFirstTask = activeCount === 0;
        const status = isFirstTask ? "RUNNING" : "PENDING";
        const now = new Date();
        const duration = 5; 
        const finishesAt = isFirstTask ? new Date(now.getTime() + (duration * 1000)) : null;

        // PREPARE UPDATES
        const userUpdateData = {
            vitality: { decrement: this.BASE_TRAVEL_VITALITY_COST },
            isInTavern: false,
            tavernEntryAt: null
        };

        // If it's the FIRST task, migrate the user's region immediately
        if (isFirstTask) {
            userUpdateData.currentRegion = targetRegionId;
        }

        // EXECUTE ATOMIC TRANSACTION
        const [updatedUser, newTask] = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: userUpdateData
            }),
            prisma.taskQueue.create({
                data: {
                    userId: userId,
                    type: "TRAVEL",
                    targetRegionId: targetRegionId,
                    status: status,
                    startedAt: isFirstTask ? now : null,
                    finishesAt: finishesAt
                }
            })
        ]);

        return newTask;
    }

    async completeTravel(_userId, taskId) {
        return await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: "COMPLETED" }
        });
    }
}

module.exports = new TravelService();
