const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import services to handle completion logic
const travelService = require('./travelService');
const gatheringService = require('./gatheringService');
const tavernService = require('./tavernService');
const craftingService = require('./craftingService');

/**
 * TaskProcessor
 * The authoritative heartbeat of the Textical engine.
 * Periodically checks for finished tasks and promotes pending ones.
 */
class TaskProcessor {
    constructor() {
        this.interval = null;
        this.HEARTBEAT_MS = 2000; // Check every 2 seconds
        this.isProcessing = false;
        
        // Counter to slow down tavern spawning (don't roll 30% every 2s)
        this.tavernTickCounter = 0;
        this.TAVERN_TICK_THRESHOLD = 30; // Check tavern roughly every 60 seconds
    }

    start() {
        if (this.interval) return;
        console.log("[HEARTBEAT] Task Processor started.");
        this.interval = setInterval(() => this.tick(), this.HEARTBEAT_MS);
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    async tick() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            await this._processFinishedTasks();
            await this._promotePendingTasks();
            
            // TAVERN ENGINE
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

    /**
     * 1. COMPLETION LOGIC
     * Finds RUNNING tasks where now > finishesAt
     */
    async _processFinishedTasks() {
        const now = new Date();
        const finishedTasks = await prisma.taskQueue.findMany({
            where: {
                status: "RUNNING",
                finishesAt: { lte: now }
            }
        });

        for (const task of finishedTasks) {
            console.log(`[HEARTBEAT] Completing ${task.type} task ID: ${task.id}`);
            
            try {
                if (task.type === "TRAVEL") {
                    await travelService.completeTravel(task.userId, task.id);
                } else if (task.type === "GATHERING") {
                    await gatheringService.completeGathering(task.userId, task.id);
                } else if (task.type === "CRAFTING") {
                    await craftingService.completeCrafting(task.userId, task.id);
                }
            } catch (err) {
                console.error(`[HEARTBEAT] Failed to complete task ${task.id}:`, err.message);
            }
        }
    }

    /**
     * 2. ACTIVATION LOGIC (Queue System)
     * Finds PENDING tasks and starts them if the user has an open slot.
     */
    async _promotePendingTasks() {
        // Find users who have PENDING tasks but NO currently RUNNING tasks
        const usersWithPending = await prisma.user.findMany({
            where: {
                taskQueue: { some: { status: "PENDING" } }
            },
            include: {
                taskQueue: { 
                    where: { status: "RUNNING" } 
                },
                premiumTier: true
            }
        });

        for (const user of usersWithPending) {
            // Free players get 1 active slot. Premium Diamond gets 1 active + 10 queue.
            // But only 1 can be "RUNNING" at a physical moment in Textical's logic.
            if (user.taskQueue.length === 0) {
                const nextTask = await prisma.taskQueue.findFirst({
                    where: { userId: user.id, status: "PENDING" },
                    orderBy: { id: 'asc' }
                });

                if (nextTask) {
                    console.log(`[HEARTBEAT] Activating PENDING task ${nextTask.id} for User ${user.id}`);
                    
                    // Note: In a real scenario, travel/gather duration should be recalculated here 
                    // based on current stats/buffs if not already set at creation.
                    const now = new Date();
                    const durationMs = 15000; // Default 15s for travel/gather if unset
                    
                    await prisma.taskQueue.update({
                        where: { id: nextTask.id },
                        data: {
                            status: "RUNNING",
                            startedAt: now,
                            finishesAt: new Date(now.getTime() + durationMs)
                        }
                    });
                }
            }
        }
    }
}

module.exports = new TaskProcessor();