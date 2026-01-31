const BaseService = require('./BaseService');
const merger = require('./inventory/InventoryMerger');
const sorter = require('./inventory/InventorySorter');

/**
 * InventorySortService
 * Orchestrates the cleanup (merge) and organization (sort) of player bags.
 */
class InventorySortService extends BaseService {
    /**
     * Consolidates stacks and returns a sorted list of inventory items.
     */
    async sortAndMerge(userId) {
        return await this.runTransaction(async (tx) => {
            // 1. Perform physical consolidation (database changes)
            await merger.consolidateStacks(tx, userId);

            // 2. Fetch the newly cleaned items
            const items = await tx.inventoryItem.findMany({
                where: { userId },
                include: { 
                    template: true,
                    equippedIn: true,
                    marketOrders: true
                }
            });

            // 3. Return the sorted array (visual sort for client)
            const sortedItems = items.sort(sorter.getComparator());
            
            this.log(`Inventory sorted and merged for User ${userId}. Rows reduced to ${sortedItems.length}.`, "Inventory");
            return sortedItems;
        });
    }
}

module.exports = new InventorySortService();
