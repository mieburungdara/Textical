const prisma = require('../db');
const vitalityService = require('./vitalityService');
const koManager = require('./vitality/KOManager');

class TravelService {
    constructor() {
        this.BASE_TRAVEL_VITALITY_COST = 5;
    }

    async startTravel(userIdRaw, targetRegionIdRaw, mode = "NORMAL") {
        const userId = parseInt(userIdRaw);
        const targetRegionId = parseInt(targetRegionIdRaw);

        // AAA: KO and Recovery Checks
        const isKO = await koManager.isKnockedOut(userId);
        if (isKO) throw new Error("You are unconscious and cannot travel.");

        const isInRecovery = await koManager.isInRecovery(userId);
        if (isInRecovery) throw new Error("You must wait for your recovery window to end before moving (1 minute peace required).");

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
        
        // AAA: Hauling Logic (Map-Stay)
        if (mode === "HAULING") {
            // In Hauling, we move to the next region instantly, but we are "Loading" into it.
            // The "Travel" task actually represents the "Stay" period in the target region.
            // Wait... standard hauling means we are AT Region A, moving TO Region B.
            // The 60s timer happens IN Region A (or B?).
            // Spec: "Pemain wajib menetap di setiap region selama 60 detik sebelum otomatis berpindah ke region berikutnya."
            // Meaning: If I am at A, going to B. I wait 60s at A? Or do I move to B and wait 60s there?
            // "Mekanisne Perjalanan... Karakter bergerak secara otomatis antar region... Pemain wajib menetap di setiap region selama 60 detik"
            // This implies the 60s timer is the "Travel Duration" effectively, but the player IS logically present in the region for ambushes.
            // Implementation: We update currentRegion to targetRegionId IMMEDIATELY (so they can be ambushed there), but lock them with a task.
            
            const stayDuration = 60; // 60 seconds strict
            const finishesAt = new Date(now.getTime() + (stayDuration * 1000));

            const operations = [
                prisma.user.update({
                    where: { id: userId },
                    data: { 
                        vitality: { decrement: this.BASE_TRAVEL_VITALITY_COST },
                        isInTavern: false,
                        tavernEntryAt: null,
                        currentRegion: targetRegionId // Update location IMMEDIATELY
                    }
                }),
                prisma.taskQueue.create({
                    data: {
                        userId: userId,
                        type: "HAULING_STAY",
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
            return { ...result[1], targetRegionType: result[1].targetRegion.visualType, message: "Hauling move initiated. Stand ground for 60s." };
        }

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