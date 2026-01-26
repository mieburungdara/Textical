const prisma = require('../db');


const travelService = require('./travelService');
const gatheringService = require('./gatheringService');
const tavernService = require('./tavernService');
const craftingService = require('./craftingService');
const socketService = require('./socketService');

class TaskProcessor {
    constructor() {
        this.interval = null;
        this.HEARTBEAT_MS = 2000; 
        this.isProcessing = false;
        this.tavernTickCounter = 0;
        this.TAVERN_TICK_THRESHOLD = 30;
    }

    start() {
        if (this.interval) return;
        console.log("[HEARTBEAT] Task Processor started.");
        this.interval = setInterval(() => this.tick(), this.HEARTBEAT_MS);
    }

    async tick() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        try {
            await this._processFinishedTasks();
            await this._promotePendingTasks();
            this.tavernTickCounter++;
            if (this.tavernTickCounter >= this.TAVERN_TICK_THRESHOLD) {
                await tavernService.tick();
                this.tavernTickCounter = 0;
            }
        } catch (err) {
            console.error("[HEARTBEAT] Error during tick:", err.message);
        } finally {
            this.isProcessing = false;
        }
    }

    async _processFinishedTasks() {
        const now = new Date();
        const finishedTasks = await prisma.taskQueue.findMany({
            where: { status: "RUNNING", finishesAt: { lte: now } }
        });

        for (const task of finishedTasks) {
            console.log(`[HEARTBEAT] Completing ${task.type} task ID: ${task.id}`);
            try {
                let payload = { taskId: task.id, type: task.type, message: `${task.type} Finished!` };

                if (task.type === "TRAVEL") {
                    await travelService.completeTravel(task.userId, task.id);
                    const region = await prisma.regionTemplate.findUnique({ where: { id: task.targetRegionId } });
                    payload.targetRegionId = parseInt(task.targetRegionId);
                    payload.targetRegionType = region ? region.type : "TOWN";
                } else if (task.type === "GATHERING") {
                    await gatheringService.completeGathering(task.userId, task.id);
                } else if (task.type === "CRAFTING") {
                    await craftingService.completeCrafting(task.userId, task.id);
                }

                socketService.emitToUser(task.userId, "task_completed", payload);
            } catch (err) {
                console.error(`[HEARTBEAT] Failed to complete task ${task.id}:`, err.message);
            }
        }
    }

    async _promotePendingTasks() {
        const usersWithPending = await prisma.user.findMany({
            where: { taskQueue: { some: { status: "PENDING" } } },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });

        for (const user of usersWithPending) {
            if (user.taskQueue.length === 0) {
                const nextTask = await prisma.taskQueue.findFirst({
                    where: { userId: user.id, status: "PENDING" },
                    orderBy: { id: 'asc' }
                });

                if (nextTask) {
                    let durationSeconds = 5; 

                    // AUTHORITATIVE DURATION CALCULATION (DB-Based)
                    if (nextTask.type === "TRAVEL") {
                        // Find connection from currentRegion to target
                        const conn = await prisma.regionConnection.findFirst({
                            where: { originRegionId: user.currentRegion, targetRegionId: nextTask.targetRegionId }
                        });
                        durationSeconds = conn ? conn.travelTimeSeconds : 5;
                    } else if (nextTask.type === "GATHERING") {
                        const res = await prisma.regionResource.findFirst({ where: { regionId: user.currentRegion, itemId: nextTask.targetItemId } });
                        durationSeconds = res ? res.gatherTimeSeconds : 5;
                    } else if (nextTask.type === "CRAFTING") {
                        const recipe = await prisma.recipeTemplate.findFirst({ where: { resultItemId: nextTask.targetItemId } });
                        durationSeconds = recipe ? recipe.craftTimeSeconds : 5;
                    }

                    // Dev Override (Optional: keep at 5s for now if you wish, but logic is restored)
                    durationSeconds = Math.min(durationSeconds, 5); 

                    // BUG FIX: For queued travels, update user location INSTANTLY when task starts
                    if (nextTask.type === "TRAVEL") {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { currentRegion: nextTask.targetRegionId }
                        });
                    }

                    const now = new Date();
                    await prisma.taskQueue.update({
                        where: { id: nextTask.id },
                        data: { 
                            status: "RUNNING", 
                            startedAt: now, 
                            finishesAt: new Date(now.getTime() + (durationSeconds * 1000)) 
                        }
                    });

                    // Emit task_started so the client UI can switch scenes/start timers
                    socketService.emitToUser(user.id, "task_started", {
                        taskId: nextTask.id,
                        type: nextTask.type,
                        duration: durationSeconds,
                        targetRegionId: nextTask.targetRegionId
                    });
                }
            }
        }
    }
}

module.exports = new TaskProcessor();
