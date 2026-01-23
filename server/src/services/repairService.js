const inventoryRepository = require('../repositories/inventoryRepository');
const userRepository = require('../repositories/userRepository');
const math = require('mathjs');

class RepairService {
    async repair(user, itemInstance) {
        const template = itemInstance.template;
        const missingDurability = math.subtract(template.baseDurability, itemInstance.currentDurability);
        
        if (missingDurability <= 0) return { message: "Item is already in perfect condition." };

        const cost = math.multiply(missingDurability, template.repairCostPerPt);
        if (user.gold < cost) throw new Error("Insufficient Gold for repairs.");

        // Deduct Gold
        await userRepository.updateGold(user.id, math.subtract(user.gold, cost));

        // Update Item
        await inventoryRepository.updateDurability(itemInstance.id, template.baseDurability);

        console.log(`[REPAIR] ${user.username} repaired ${itemInstance.templateId} for ${cost} Gold`);
        return { success: true, cost };
    }
}

module.exports = new RepairService();
