const BaseService = require('../BaseService');
const inventoryService = require('../inventoryService');
const transactionManager = require('../economy/TransactionManager');
const resolver = require('../../logic/economy/CurrencyResolver');

/**
 * HaulingService
 * Orchestrates Caravan Rentals, Cargo Management, and Logistics.
 */
class HaulingService extends BaseService {
    constructor() {
        super();
        this.TIERS = {
            "SMALL": { capacity: 5, baseRate: 50 },
            "MEDIUM": { capacity: 10, baseRate: 100 },
            "LARGE": { capacity: 15, baseRate: 200 },
            "HEAVY": { capacity: 20, baseRate: 500 }
        };
    }

    /**
     * Rents a wagon for a specific route.
     */
    async rentWagon(userId, tier, originId, targetId, path) {
        if (!this.TIERS[tier]) throw new Error("Invalid wagon tier.");
        
        const user = await this.db.user.findUnique({ where: { id: userId }, include: { activeWagon: true } });
        if (user.activeWagon) throw new Error("You already have an active wagon.");
        if (user.currentRegion !== originId) throw new Error("You must be at the origin city to rent a wagon.");

        const config = this.TIERS[tier];
        const costSilver = BigInt(config.baseRate * path.length);

        // Verify user has enough funds (Silver-based)
        const userTotalSilver = resolver.getTotalSilver(user);
        if (userTotalSilver < costSilver) {
            throw new Error(`Insufficient funds. Need ${costSilver} silver, have: ${userTotalSilver}`);
        }

        return await this.runTransaction(async (tx) => {
            // Deduct Silver
            await transactionManager.removeCurrency(tx, userId, costSilver, "WAGON_RENTAL", null, null);

            // Create Wagon
            const wagon = await tx.wagon.create({
                data: {
                    userId,
                    tier,
                    capacity: config.capacity,
                    status: "LOADING",
                    originRegionId: originId,
                    targetRegionId: targetId,
                    selectedPath: JSON.stringify(path),
                    currentPathIndex: 0,
                    feePaid: Number(costSilver)
                }
            });

            this.log(`Wagon Rented: User ${userId} rented ${tier} wagon for ${costSilver} silver.`, "Logistics");
            return wagon;
        });
    }

    /**
     * Loads an item from personal inventory to the wagon.
     */
    async loadItem(userId, itemInstanceId, quantity = 1) {
        const wagon = await this.db.wagon.findUnique({ where: { userId } });
        if (!wagon || wagon.status !== "LOADING") throw new Error("No active wagon in loading phase.");

        // Check Wagon Capacity via InventoryService (Phase 2 Logic)
        const item = await this.db.inventoryItem.findUnique({ where: { id: itemInstanceId } });
        if (!item) throw new Error("Item not found.");

        const hasSpace = await inventoryService.hasSpace(userId, item.templateId, quantity, wagon.id);
        if (!hasSpace) throw new Error("Wagon is full.");

        return await this.runTransaction(async (tx) => {
            // Remove from Personal Inventory
            await inventoryService.removeItem(userId, itemInstanceId, quantity);

            // Add to Wagon Inventory (WagonItem)
            // Note: Wagon items do not have durability logic in this iteration, simplified as Cargo
            await tx.wagonItem.create({
                data: {
                    wagonId: wagon.id,
                    templateId: item.templateId,
                    quantity: quantity
                }
            });

            return { success: true };
        });
    }

    /**
     * Unloads an item from wagon to personal inventory.
     */
    async unloadItem(userId, wagonItemId) {
        const wagon = await this.db.wagon.findUnique({ where: { userId } });
        if (!wagon) throw new Error("No active wagon.");

        const wItem = await this.db.wagonItem.findUnique({ where: { id: wagonItemId } });
        if (!wItem) throw new Error("Cargo item not found.");

        // Check Personal Inventory Space
        const hasSpace = await inventoryService.hasSpace(userId, wItem.templateId, wItem.quantity);
        if (!hasSpace) throw new Error("Your personal inventory is full.");

        return await this.runTransaction(async (tx) => {
            await tx.wagonItem.delete({ where: { id: wagonItemId } });
            await inventoryService.addItem(userId, wItem.templateId, wItem.quantity, tx);
            return { success: true };
        });
    }

    /**
     * Completes the hauling journey, moves items to bank (simulated), and destroys wagon.
     */
    async completeHaul(userId) {
        const wagon = await this.db.wagon.findUnique({ where: { userId }, include: { items: true } });
        if (!wagon) return;

        // In a real implementation, we would move items to a 'Bank' model.
        // For this checkpoint, we will assume they are "Delivered" and just clean up.
        // The audit script manually unloads to inventory to verify integrity, 
        // but this method officially closes the loop.
        
        await this.runTransaction(async (tx) => {
            await tx.wagonItem.deleteMany({ where: { wagonId: wagon.id } });
            await tx.wagon.delete({ where: { id: wagon.id } });
            // Optionally reward reputation/gold here
        });
        
        this.log(`Haul Completed: User ${userId} arrived at destination. Wagon dismantled.`, "Logistics");
    }

    /**
     * Processes a tick for a hauling journey (Ambush Check).
     * To be called by a cron/scheduler every 10 seconds.
     */
    async processTick(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { 
                region: true,
                taskQueue: { where: { status: "RUNNING", type: "HAULING_STAY" } } 
            }
        });

        if (!user || user.taskQueue.length === 0) return { status: "IDLE" };

        const task = user.taskQueue[0];
        const region = user.region;

        // 1. Safety Check (Green Zone = Safe)
        if (region.zoneType === "GREEN") {
            return { status: "SAFE", message: "Zone is safe. Continuing journey." };
        }

        // 2. Monster Ambush Roll
        // Danger Level 1 = 5%, Level 10 = 50% per tick
        const ambushChance = region.dangerLevel * 0.05; 
        if (Math.random() < ambushChance) {
            // Trigger Ambush!
            // In a real scenario, this would pause the task or trigger a battle notification.
            // For now, we return the status so the controller can handle the battle trigger.
            return { status: "AMBUSH_TRIGGERED", dangerLevel: region.dangerLevel };
        }

        return { status: "SAFE", message: "No ambush detected this tick." };
    }
}

module.exports = new HaulingService();
