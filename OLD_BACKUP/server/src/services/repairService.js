const inventoryRepository = require('../repositories/inventoryRepository');
const transactionManager = require('./economy/TransactionManager');
const resolver = require('../logic/economy/CurrencyResolver');

class RepairService {
    async repair(user, itemInstance) {
        const template = itemInstance.template;
        const missingDurability = template.baseDurability - itemInstance.currentDurability;
        
        if (missingDurability <= 0) return { message: "Item is already in perfect condition." };

        const costSilver = BigInt(missingDurability * template.repairCostPerPt);
        
        // Verify user has enough funds (Silver-based)
        const userTotalSilver = resolver.getTotalSilver(user);
        if (userTotalSilver < costSilver) {
            throw new Error(`Insufficient funds for repairs. Need ${costSilver} silver, have: ${userTotalSilver}`);
        }

        // Deduct Silver via TransactionManager
        await transactionManager.removeCurrency(null, user.id, costSilver, "REPAIR", itemInstance.id, "INVENTORY_ITEM");

        // Update Item
        await inventoryRepository.updateDurability(itemInstance.id, template.baseDurability);

        console.log(`[REPAIR] ${user.username} repaired ${itemInstance.templateId} for ${costSilver} silver`);
        return { success: true, cost: costSilver };
    }
}

module.exports = new RepairService();
