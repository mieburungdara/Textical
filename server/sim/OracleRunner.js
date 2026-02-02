const prisma = require('../src/db');
const brain = require('./OracleBrain');
const gatheringService = require('../src/services/gatheringService');
const craftingService = require('../src/services/craftingService');
const marketService = require('../src/services/marketService');
const salvageService = require('../src/services/crafting/SalvageService');
const repairService = require('../src/services/economy/RepairService');

/**
 * OracleRunner
 * Orchestrates the massive 100-player loop for world simulation.
 */
class OracleRunner {
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
                include: { inventory: { include: { template: true, equippedIn: true } }, taskQueue: { where: { status: "RUNNING" } }, heroes: { where: { isMain: true } } }
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
                    // AAA: Dynamic resource selection for simulation accuracy
                    const resources = await prisma.regionResource.findMany({ where: { regionId: user.currentRegion } });
                    if (resources.length > 0) {
                        const target = resources[Math.floor(Math.random() * resources.length)];
                        await gatheringService.startGathering(user.id, user.heroes[0].id, target.id);
                    }
                    break;
                case "CRAFT":
                    await craftingService.startCrafting(user.id, 1); // Recipe 1
                    break;
                case "SALVAGE":
                    // Find first gear item
                    const gear = user.inventory.find(i => i.template.category !== "MATERIAL");
                    if (gear) {
                        await salvageService.salvageItem(user.id, gear.id);
                    }
                    break;
                case "REPAIR":
                    // Find first damaged equipped item
                    const broken = user.inventory.find(i => i.equippedIn && i.currentDurability < i.maxDurability);
                    if (broken) {
                        await repairService.repairItem(user.id, broken.id);
                    }
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
            console.error(`   ❌ [Bot ${user.username}] Action ${action} Failed: ${e.message}`);
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

module.exports = OracleRunner;
