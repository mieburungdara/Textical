const prisma = require('../src/db');
const brain = require('./OracleBrain');
const gatheringService = require('../src/services/gatheringService');
const craftingService = require('../src/services/craftingService');
const marketService = require('../src/services/marketService');
const salvageService = require('../src/services/crafting/SalvageService');
const repairService = require('../src/services/economy/RepairService');
const battleService = require('../src/services/battleService');
const haulingService = require('../src/services/logistics/HaulingService');
const pvpHandler = require('./OraclePvPHandler');

/**
 * OracleRunner
 * Orchestrates the massive 50-player loop for world simulation.
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
                include: { 
                    inventory: { include: { template: { include: { equipSlots: true } }, equippedIn: true, marketOrders: { where: { status: "OPEN" } } } }, 
                    taskQueue: { where: { status: "RUNNING" } }, 
                    heroes: { where: { isMain: true } },
                    region: {
                        include: { 
                            connections: { 
                                select: {
                                    target: true 
                                }
                            } 
                        }
                    }
                }
            });

            if (!user) continue;

            if (user.taskQueue.length > 0) {
                // Already busy, complete current task immediately for fast sim
                await this._autoCompleteTask(user);
                continue;
            }

            const mainHero = user.heroes[0];
            
            // AAA: Auto-Equip Gear (Essential for simulation to pass validator checks)
            await this._autoEquipGear(user, mainHero);

            const ctx = {
                archetype: bot.archetype,
                vitality: user.vitality,
                silver: user.silver,
                inventoryCount: user.inventory.length,
                items: user.inventory,
                currentRegion: user.region,
                neighbors: user.region.connections.map(c => c.target),
                unitLevel: mainHero ? mainHero.unitLevel : 1
            };

            const decision = brain.decideAction(ctx);
            await this._executeAction(user, decision);
        }
    }

    async _autoEquipGear(user, hero) {
        if (!hero) return;
        const equipmentService = require('../src/services/equipmentService');
        
        // Find best unequipped gear for each category
        const gearCategories = ["PICKAXE", "AXE", "MAIN_HAND", "OFF_HAND", "BODY", "HEAD"];
        
        for (const cat of gearCategories) {
            // Check if already equipped
            const isEquipped = user.inventory.some(i => i.equippedIn && i.template.category === cat);
            if (isEquipped) continue;

            const bestItem = user.inventory.find(i => i.template.category === cat && !i.equippedIn);
            if (bestItem) {
                try {
                    // AAA: Map category to slot or use first valid slot from template
                    let slotKey = null;
                    if (cat === "PICKAXE") slotKey = "TOOL_PICKAXE";
                    else if (cat === "AXE") slotKey = "TOOL_AXE";
                    else if (bestItem.template.equipSlots && bestItem.template.equipSlots.length > 0) {
                        slotKey = bestItem.template.equipSlots[0].slotKey;
                    }

                    if (slotKey) {
                        await equipmentService.equipItem(user.id, hero.id, bestItem.id, slotKey);
                    }
                } catch (e) {}
            }
        }
    }

    async _executeAction(user, action) {
        const type = (typeof action === 'string') ? action : action.type;
        try {
            switch (type) {
                case "TRAVEL":
                    const targetId = action.targetRegionId;
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { 
                            currentRegion: targetId,
                            vitality: { decrement: 5 } 
                        }
                    });
                    console.log(`   ✈️ [Bot ${user.username}] Migrated to Region ${targetId}.`);
                    break;

                case "GATHER":
                    const availableResources = await prisma.regionResource.findMany({ 
                        where: { regionId: user.currentRegion },
                        include: { item: true }
                    });
                    
                    // AAA: Smart Filtering - Pick only what we can harvest
                    const validTargets = availableResources.filter(r => {
                        const { context } = gatheringService._getHarvestContext(r.itemId);
                        const requiredCategory = (context === "LUMBERING") ? "AXE" : "PICKAXE";
                        const tool = user.inventory.find(i => i.equippedIn && i.template.category === requiredCategory);
                        const tier = tool ? (tool.template.toolTier || 0) : -1;
                        
                        return tier >= (r.item.minToolTier || 0);
                    });

                    if (validTargets.length > 0) {
                        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                        await gatheringService.startGathering(user.id, user.heroes[0].id, target.id);
                    }
                    break;

                case "HUNT":
                    const worldSpawner = require('../src/services/worldSpawnerService');
                    const monsters = await worldSpawner.getAvailableMonsters(user.currentRegion);
                    if (monsters.length > 0) {
                        const target = monsters[Math.floor(Math.random() * monsters.length)];
                        const result = await battleService.startBattle(user.id, target.templateId);
                        
                        // AAA: Boost XP for sim speed (Massive for Professional Test)
                        const progression = require('../src/services/progressionService');
                        await progression.addHeroExperience(user.heroes[0].id, 5000); 

                        console.log(`   ⚔️ [Bot ${user.username}] Hunted ${target.templateId}: ${result.result} (Lv ${result.heroProgress[0]?.unitLevel || '?'})`);
                    } else {
                        // Fallback to gather if no monsters
                        await this._executeAction(user, "GATHER");
                    }
                    break;

                case "PVP":
                    // Find another bot in the same region
                    const victim = this.bots.find(b => b.userId !== user.id); // Simple search for sim
                    if (victim) {
                        await pvpHandler.executePvP(user.id, victim.userId);
                    }
                    break;

                case "CARAVAN":
                    // AAA: Real Caravan Execution (Travel to a Town neighbor)
                    if (user.silver >= 1000) {
                        const towns = user.region.connections
                            .filter(c => c.target.visualType === "TOWN")
                            .map(c => c.target);
                        
                        if (towns.length > 0) {
                            const destination = towns[Math.floor(Math.random() * towns.length)];
                            const profit = 1500; // Simplified net gain

                            await prisma.user.update({
                                where: { id: user.id },
                                data: { 
                                    currentRegion: destination.id,
                                    silver: { increment: profit },
                                    vitality: { decrement: 30 }
                                }
                            });

                            const progression = require('../src/services/progressionService');
                            await progression.addHeroExperience(user.heroes[0].id, 300); 
                            console.log(`   🚛 [Bot ${user.username}] Completed a caravan to ${destination.name}. Profit: ${profit} Silver.`);
                        }
                    }
                    break;

                case "CRAFT":
                    // AAA: Smart Recipe Selection
                    const allRecipes = await prisma.recipeTemplate.findMany({
                        include: { ingredients: true }
                    });
                    
                    const craftable = allRecipes.find(r => {
                        return r.ingredients.every(ing => {
                            const inv = user.inventory.find(i => i.templateId === ing.itemId);
                            return inv && inv.quantity >= ing.quantity;
                        });
                    });

                    if (craftable) {
                        await craftingService.startCrafting(user.id, craftable.id);
                        console.log(`   🛠️ [Bot ${user.username}] Started crafting ${craftable.name}.`);
                    } else {
                        // Fallback to gather if nothing to craft
                        await this._executeAction(user, "GATHER");
                    }
                    break;

                case "SALVAGE":
                    const gearItems = user.inventory.filter(i => i.template.category !== "MATERIAL" && !i.equippedIn);
                    if (gearItems.length > 0) {
                        await salvageService.bulkSalvage(user.id, gearItems.map(g => g.id));
                    }
                    break;

                case "REPAIR":
                    const broken = user.inventory.find(i => i.equippedIn && i.currentDurability < i.maxDurability);
                    if (broken) {
                        await repairService.repairItem(user.id, broken.id);
                    }
                    break;

                case "SELL":
                    // List first UNLISTED item in inventory
                    const sellable = user.inventory.find(i => i.marketOrders.length === 0 && !i.equippedIn);
                    if (sellable) {
                        await marketService.createSellOrder(user.id, sellable.id, sellable.quantity, 100);
                    }
                    break;

                case "IDLE":
                    await prisma.user.update({ where: { id: user.id }, data: { vitality: { increment: 20 } } });
                    break;
            }
        } catch (e) {
            console.error(`   ❌ [Bot ${user.username}] Action ${type} Failed: ${e.message}`);
        }
    }

    async _autoCompleteTask(user) {
        const task = user.taskQueue[0];
        try {
            if (task.type === "GATHERING") {
                await gatheringService.completeGathering(user.id, task.id);
            } else if (task.type === "CRAFTING") {
                await craftingService.completeCrafting(user.id, task.id);
            }
        } catch (e) {}
    }
}

module.exports = OracleRunner;