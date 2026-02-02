const prisma = require('../../db');
const brain = require('../../logic/sim/BehaviorBrain');
const gatheringService = require('../../services/gatheringService');
const craftingService = require('../../services/craftingService');
const marketService = require('../../services/marketService');

/**
 * SimRunner
 * Orchestrates the massive 100-player loop.
 */
class SimRunner {
    constructor(bots) {
        this.bots = bots; // Array of { userId, archetype }
    }

    /**
     * Runs one "Simulated Hour" (one pass through all bots).
     */
    async runHour(hourIndex) {
        console.log(`\n⏳ SIM HOUR ${hourIndex} STARTING...`);
        
        for (const bot of this.bots) {
            const user = await prisma.user.findUnique({
                where: { id: bot.userId },
                include: { inventory: true, taskQueue: { where: { status: "RUNNING" } }, heroes: { where: { isMain: true } } }
            });

            if (user.taskQueue.length > 0) {
                // Already busy, complete current task immediately for fast sim
                await this._autoCompleteTask(user);
                continue;
            }

            const ctx = {
                archetype: bot.archetype,
                vitality: user.vitality,
                silver: user.silver,
                inventoryCount: user.inventory.length,
                items: user.inventory
            };

            const action = brain.decideAction(ctx);
            await this._executeAction(user, action);
        }
    }

    async _executeAction(user, action) {
        try {
            switch (action) {
                case "GATHER":
                    await gatheringService.startGathering(user.id, user.heroes[0].id, 1); // Region 1 resource
                    break;
                case "CRAFT":
                    await craftingService.startCrafting(user.id, 1); // Recipe 1
                    break;
                case "SELL":
                    // List first item in inventory
                    if (user.inventory.length > 0) {
                        await marketService.createSellOrder(user.id, user.inventory[0].id, user.inventory[0].quantity, 100);
                    }
                    break;
                case "IDLE":
                    // Restore some vitality manually for sim speed
                    await prisma.user.update({ where: { id: user.id }, data: { vitality: { increment: 20 } } });
                    break;
            }
        } catch (e) {
            // Silently fail if requirements not met during sim
        }
    }

    async _autoCompleteTask(user) {
        const task = user.taskQueue[0];
        if (task.type === "GATHERING") {
            await gatheringService.completeGathering(user.id, task.id);
        } else if (task.type === "CRAFTING") {
            await craftingService.completeCrafting(user.id, task.id);
        }
    }
}

module.exports = SimRunner;
