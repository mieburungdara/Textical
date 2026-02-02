const BaseService = require('../BaseService');
const transactionManager = require('./TransactionManager');
const resolver = require('../../logic/economy/RepairCostResolver');

/**
 * RepairService
 * Orchestrates equipment maintenance and durability restoration.
 */
class RepairService extends BaseService {
    /**
     * Fully restores an item's durability.
     */
    async repairItem(userId, itemInstanceId) {
        const item = await this.db.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");
        if (item.currentDurability === item.maxDurability) throw new Error("Item is already at full durability.");

        // 1. Resolve Cost
        const cost = resolver.resolveCost(item);

        // 2. Execute Transaction
        return await this.runTransaction(async (tx) => {
            // a. Deduct Silver
            await transactionManager.removeCurrency(tx, userId, cost, "REPAIR_FEE", item.templateId, "ITEM");

            // b. Restore Durability
            const updated = await tx.inventoryItem.update({
                where: { id: itemInstanceId },
                data: { currentDurability: item.maxDurability }
            });

            this.log(`User ${userId} repaired ${item.template.name} for ${cost} Silver.`, "Repair");
            return updated;
        });
    }

    /**
     * Repairs all items currently in user inventory (helper).
     */
    async repairAll(userId) {
        const items = await this.db.inventoryItem.findMany({
            where: { userId, currentDurability: { lt: this.db.inventoryItem.fields.maxDurability } },
            include: { template: true }
        });

        for (const item of items) {
            await this.repairItem(userId, item.id);
        }
    }
}

module.exports = new RepairService();
