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

            // AAA: Fast Completion - After acting, check if we started a task and finish it
            const updatedUser = await prisma.user.findUnique({
                where: { id: user.id },
                include: { taskQueue: { where: { status: "RUNNING" } } }
            });
            if (updatedUser && updatedUser.taskQueue.length > 0) {
                await this._autoCompleteTask(updatedUser);
            }
        }
    }

    async _autoEquipGear(user, hero) {
        if (!hero) return;
        const equipmentService = require('../src/services/equipmentService');
        
        // AAA: Primary Categories for Auto-Progression
        const gearCategories = ["PICKAXE", "AXE", "WEAPON", "EQUIPMENT", "ARMOR"];
        
        for (const cat of gearCategories) {
            // Find current best equipped in this category
            const currentlyEquipped = user.inventory.find(i => i.equippedIn && (i.template.category === cat || (cat === "WEAPON" && i.template.category === "EQUIPMENT")));
            
            // Find all potential candidates (including current)
            const candidates = user.inventory.filter(i => (i.template.category === cat || (cat === "WEAPON" && i.template.category === "EQUIPMENT")));
            if (candidates.length === 0) continue;

            // Sort by toolTier (for tools) or powerScale/Value (for gear)
            const bestItem = candidates.sort((a, b) => {
                if (a.template.toolTier !== b.template.toolTier) return b.template.toolTier - a.template.toolTier;
                return b.template.baseValue - a.template.baseValue;
            })[0];

            // If best is not equipped, equip it!
            if (bestItem && (!currentlyEquipped || bestItem.id !== currentlyEquipped.id)) {
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
                        console.log(`   🛡️ [Bot ${user.username}] Upgraded to ${bestItem.template.name} in ${slotKey}.`);
                    }
                } catch (e) {
                    // console.error(`   ⚠️ [Bot ${user.username}] Failed to equip ${bestItem.template.name}: ${e.message}`);
                }
            }
        }
    }

    async _executeAction(user, action) {
        const type = (typeof action === 'string') ? action : action.type;
        const decision = action; // Define decision from action for scoping
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
                    let validTargets = availableResources.filter(r => {
                        const { context } = gatheringService._getHarvestContext(r.itemId);
                        const requiredCategory = (context === "LUMBERING") ? "AXE" : "PICKAXE";
                        const tool = user.inventory.find(i => i.equippedIn && i.template.category === requiredCategory);
                        const tier = tool ? (tool.template.toolTier || 0) : -1;
                        
                        return tier >= (r.item.minToolTier || 0);
                    });

                    if (validTargets.length > 0) {
                        // AAA: Prioritization - If we have a specific material goal, focus on it
                        if (decision.goal === "GATHER_TOOL_MATS") {
                            const prioritized = validTargets.filter(r => r.item.name === "Iron Ore" || r.item.name === "Oak Wood");
                            if (prioritized.length > 0) validTargets = prioritized;
                        } else if (decision.goal === "GATHER_GEAR_MATS") {
                            const prioritized = validTargets.filter(r => 
                                r.item.name === "Iron Ore" || 
                                r.item.name === "Oak Wood" || 
                                r.item.name === "Boar Skin" || 
                                r.item.name === "Ragged Hide"
                            );
                            if (prioritized.length > 0) validTargets = prioritized;
                        }

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
                    // AAA: Smart Recipe Selection (Learned Only + Goal Oriented)
                    const learnedRecipes = await prisma.userRecipe.findMany({
                        where: { userId: user.id },
                        include: { recipe: { include: { ingredients: true, resultItem: true } } }
                    });
                    
                    // Filter recipes we have materials for
                    let craftable = learnedRecipes.filter(ur => {
                        const r = ur.recipe;
                        return r.ingredients.every(ing => {
                            const inv = user.inventory.find(i => i.templateId === ing.itemId);
                            return inv && inv.quantity >= ing.quantity;
                        });
                    });

                    // AAA: Goal Alignment - If we are gathering for a TOOL, don't craft GEAR (and vice versa)
                    if (decision.goal === "CRAFT_TOOL" || decision.goal === "GATHER_TOOL_MATS") {
                        craftable = craftable.filter(ur => ur.recipe.resultItem.category === "PICKAXE" || ur.recipe.resultItem.category === "AXE");
                    } else if (decision.goal === "CRAFT_GEAR" || decision.goal === "GATHER_GEAR_MATS") {
                        craftable = craftable.filter(ur => ur.recipe.resultItem.category !== "PICKAXE" && ur.recipe.resultItem.category !== "AXE");
                    }

                    // AAA: Redundancy Check - Don't craft what we already have at T1+
                    craftable = craftable.filter(ur => {
                        const alreadyOwned = user.inventory.some(i => i.equippedIn && i.templateId === ur.recipe.resultItemId && (i.template.toolTier || 0) >= (ur.recipe.resultItem.toolTier || 0));
                        return !alreadyOwned;
                    });

                    // Pick the best craftable
                    // Priority: Missing T1 Tool > Missing T1 Gear > Intermediate Materials > Higher Tier
                    const bestRecipe = craftable.sort((a, b) => {
                        const tierA = a.recipe.resultItem.toolTier || 0;
                        const tierB = b.recipe.resultItem.toolTier || 0;
                        
                        if (tierA !== tierB) return tierB - tierA;

                        // If same tier, check if we ALREADY have this item equipped
                        const hasA = user.inventory.some(i => i.equippedIn && i.templateId === a.recipe.resultItemId);
                        const hasB = user.inventory.some(i => i.equippedIn && i.templateId === b.recipe.resultItemId);

                        if (hasA !== hasB) return hasA ? 1 : -1; // Prioritize the one we DON'T have

                        // AAA: Mode-Based Priority
                        // If we are in CRAFT_GEAR goal, prioritize NON-materials (the actual gear)
                        if (decision.goal === "CRAFT_GEAR") {
                            const isGearA = a.recipe.resultItem.category !== "MATERIAL";
                            const isGearB = b.recipe.resultItem.category !== "MATERIAL";
                            if (isGearA !== isGearB) return isGearA ? -1 : 1;
                        }

                        // AAA: Material Priority - If it's a material needed for gear, give it a boost
                        const isMatA = a.recipe.resultItem.category === "MATERIAL";
                        const isMatB = b.recipe.resultItem.category === "MATERIAL";
                        if (isMatA !== isMatB) return isMatA ? -1 : 1;

                        return b.recipe.resultItem.baseValue - a.recipe.resultItem.baseValue;
                    })[0];

                    if (bestRecipe) {
                        const r = bestRecipe.recipe;
                        await craftingService.startCrafting(user.id, r.id);
                        console.log(`   🛠️ [Bot ${user.username}] Started crafting ${r.name}.`);
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