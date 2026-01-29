const prisma = require('../db');
const socketService = require('./socketService');
const tavernService = require('./tavernService');
const marketService = require('./marketService');

// Strategy Imports
const TravelTaskHandler = require('./tasks/TravelTaskHandler');
const GatheringTaskHandler = require('./tasks/GatheringTaskHandler');
const CraftingTaskHandler = require('./tasks/CraftingTaskHandler');

/**
 * TaskProcessor (Heartbeat v2.0)
 * Uses a component-based pipeline to process and promote user tasks.
 */
class TaskProcessor {
    constructor() {
        this.interval = null;
        this.HEARTBEAT_MS = 2000; 
        this.isProcessing = false;
        this.tavernTickCounter = 0;
        this.TAVERN_TICK_THRESHOLD = 30;

        // Initialize Handlers
        this.handlers = {
            "TRAVEL": new TravelTaskHandler(prisma),
            "GATHERING": new GatheringTaskHandler(prisma),
            "CRAFTING": new CraftingTaskHandler(prisma)
        };
    }

    start() {
        if (this.interval) return;
        console.log("[HEARTBEAT] Modular Task Pipeline Engaged.");
        this.interval = setInterval(() => this.tick(), this.HEARTBEAT_MS);
    }

    async tick() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        try {
            await this._processFinishedTasks();
            await this._promotePendingTasks();
            await this._processWorldTicks();
        } catch (err) {
            console.error("[HEARTBEAT] Pipe Error:", err.message);
        } finally {
            this.isProcessing = false;
        }
    }

    async _processFinishedTasks() {
        const now = new Date();
        const finishedTasks = await prisma.taskQueue.findMany({
            where: { status: "RUNNING", finishesAt: { lte: now } },
            include: { targetRegion: true }
        });

        for (const task of finishedTasks) {
            const handler = this.handlers[task.type];
            if (!handler) {
                console.warn(`[HEARTBEAT] No handler for task type: ${task.type}`);
                continue;
            }

            try {
                await handler.complete(task);
                const extraPayload = await handler.getCompletionPayload(task);
                
                socketService.emitToUser(task.userId, "task_completed", {
                    taskId: task.id,
                    type: task.type,
                    message: `${task.type} Finished!`,
                    ...extraPayload
                });
            } catch (err) {
                console.error(`[HEARTBEAT] Task ${task.id} failed:`, err.message);
                await prisma.taskQueue.update({ where: { id: task.id }, data: { status: "FAILED" } });
                socketService.emitToUser(task.userId, "task_failed", { taskId: task.id, type: task.type, error: err.message });
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
                    orderBy: { id: 'asc' },
                    include: { targetRegion: true }
                });

                if (nextTask) {
                    const handler = this.handlers[nextTask.type];
                    const duration = handler ? await handler.getDuration(nextTask, user) : 5;
                    const now = new Date();
                    
                    await prisma.taskQueue.update({
                        where: { id: nextTask.id },
                        data: { 
                            status: "RUNNING", 
                            startedAt: now, 
                            finishesAt: new Date(now.getTime() + (duration * 1000)) 
                        }
                    });

                    socketService.emitToUser(user.id, "task_started", {
                        taskId: nextTask.id, type: nextTask.type, duration, targetRegion: nextTask.targetRegion
                    });
                }
            }
        }
    }

    async _processWorldTicks() {
        this.tavernTickCounter++;
        if (this.tavernTickCounter >= this.TAVERN_TICK_THRESHOLD) {
            await tavernService.tick();
            await marketService.archiveExpiredListings();
            this.tavernTickCounter = 0;
        }
    }
}

module.exports = new TaskProcessor();