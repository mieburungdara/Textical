const prisma = require('../db');
const energyService = require('./energyService');
const koManager = require('./energy/KOManager');
const TravelIncidentResolver = require('../logic/world/TravelIncidentResolver');
const { AppError, ErrorCodes } = require('../utils/AppError');

class TravelService {
    constructor() {
        /** @type {number} */
        this.BASE_TRAVEL_ENERGY_COST = 5;
    }

    /**
     * Start a travel journey for a user.
     * @param {string|number} userIdRaw - ID of the user.
     * @param {string|number} targetRegionIdRaw - ID of the target region.
     * @param {string} [mode="NORMAL"] - Travel mode (NORMAL or HAULING).
     * @returns {Promise<Object>} Task information or encounter result.
     */
    async startTravel(userIdRaw, targetRegionIdRaw, mode = "NORMAL") {
        const userId = parseInt(userIdRaw.toString());
        const targetRegionId = parseInt(targetRegionIdRaw.toString());

        // 1. Core Health & State Checks
        const isKO = await koManager.isKnockedOut(userId);
        if (isKO) throw new AppError(ErrorCodes.TRAVEL_UNCONSCIOUS, 'You are unconscious and cannot travel.');

        const isInRecovery = await koManager.isInRecovery(userId);
        if (isInRecovery) throw new AppError(ErrorCodes.TRAVEL_IN_RECOVERY, 'You must wait for your recovery window to end before moving (1 minute peace required).');

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { 
                taskQueue: {
                    where: { status: { in: ["RUNNING", "PENDING"] } },
                    orderBy: { id: 'desc' },
                    take: 1
                },
                premiumTier: true, 
                _count: { select: { heroes: true } }
            }
        });

        if (!user) throw new AppError(ErrorCodes.USER_NOT_FOUND, 'User not found');
        
        const totalActiveTasks = await prisma.taskQueue.count({
            where: { userId, status: { in: ["RUNNING", "PENDING"] } }
        });

        if (totalActiveTasks > 0) {
            throw new AppError(ErrorCodes.TRAVEL_BUSY, 'You cannot start a journey while busy with other actions.');
        }

        const connection = await prisma.regionConnection.findFirst({
            where: { originRegionId: user.currentRegion, targetRegionId: targetRegionId },
            include: { target: true }
        });

        if (!connection) throw new AppError(ErrorCodes.TRAVEL_NO_PATH, 'No direct path exists from here.');

        // 2. Black Zone Entry Requirement
        if (connection.target.zoneType === 'BLACK') {
            const heroCount = user._count.heroes;
            if (heroCount < 30) {
                throw new AppError(ErrorCodes.TRAVEL_BLACK_ZONE_MIN_UNITS, 
                    `Black Zone Danger: You need a minimum size of 30 units to survive here. Current: ${heroCount}`,
                    { context: { required: 30, current: heroCount } }
                );
            }
        }

        // 3. Energy Management
        await energyService.syncUserEnergy(userId);
        const freshUser = await prisma.user.findUnique({ where: { id: userId } });
        if (freshUser.energy < this.BASE_TRAVEL_ENERGY_COST) {
            throw new AppError(ErrorCodes.TRAVEL_ENERGY_COST, 'Not enough Energy.');
        }

        // 4. Incident Resolution (Bandits, Spirits) - Delegated to Resolver
        const incident = await TravelIncidentResolver.resolveIncidents(userId, connection, freshUser);
        if (incident && incident.type === "AMBUSH") {
            return {
                status: "AMBUSHED",
                message: incident.message,
                ransomCost: incident.ransomCost,
                regionId: incident.regionId
            };
        }

        // 5. Per-Grid Deductions (Escort Quota)
        /** @type {Object.<string, any>} */
        let escortUpdate = {};
        if (freshUser.escortGridsRemaining > 0) {
            escortUpdate = {
                escortGridsRemaining: { decrement: 1 }
            };
            if (freshUser.escortGridsRemaining === 1) {
                escortUpdate.activeEscortName = null;
            }
        }

        // 6. Task Orchestration (NORMAL vs HAULING)
        if (mode === "HAULING") {
            return await this._executeTravelTask(userId, user.currentRegion, targetRegionId, "HAULING_STAY", 60, escortUpdate);
        }

        const duration = connection.travelTimeSeconds || 15; 
        const task = await this._executeTravelTask(userId, user.currentRegion, targetRegionId, "TRAVEL", duration, escortUpdate);

        return { 
            ...task, 
            targetRegionType: task.targetRegion ? task.targetRegion.visualType : "TOWN",
            ambientSign: TravelIncidentResolver.getAmbientSigns(connection.target.banditThreatLevel),
            spiritEncounter: incident && incident.type === "SPIRIT" ? incident.data : null
        };
    }

    /**
     * Internal helper to execute the travel transaction
     * @private
     * @param {number} userId - User ID.
     * @param {number} originId - Origin region ID.
     * @param {number} targetId - Target region ID.
     * @param {string} type - Task type.
     * @param {number} duration - Seconds to complete.
     * @param {Object} escortUpdate - Escort quota changes.
     * @returns {Promise<Object>} Created task with UNIX timestamps.
     */
    async _executeTravelTask(userId, originId, targetId, type, duration, escortUpdate) {
        const now = new Date();
        const finishesAt = new Date(now.getTime() + (duration * 1000));

        const result = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { 
                    energy: { decrement: this.BASE_TRAVEL_ENERGY_COST },
                    isInTavern: false,
                    tavernEntryAt: null,
                    ...(type === "HAULING_STAY" ? { currentRegion: targetId } : {}),
                    ...escortUpdate
                }
            }),
            prisma.taskQueue.create({
                data: {
                    userId,
                    type,
                    originRegionId: originId,
                    targetRegionId: targetId,
                    status: "RUNNING",
                    startedAt: now,
                    finishesAt: finishesAt
                },
                include: { targetRegion: true } 
            })
        ]);

        // Convert to UNIX timestamps (milliseconds) for API response
        const task = result[1];
        return {
            ...task,
            startedAt: task.startedAt.getTime(),
            finishesAt: task.finishesAt.getTime()
        };
    }

    async completeTravel(userId, taskId) {
        const task = await prisma.taskQueue.findUnique({
            where: { id: taskId }
        });

        if (!task || task.status !== "RUNNING") return;

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
