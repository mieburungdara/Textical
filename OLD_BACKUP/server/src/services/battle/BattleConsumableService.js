const BaseService = require('../BaseService');
const consumableService = require('../consumableService');

class BattleConsumableService extends BaseService {
    /**
     * Calculate total potions used in battle.
     * @param {Array} units - Battle units.
     * @returns {number} Total potions used.
     */
    calculatePotionsUsed(units) {
        if (!units) return 0;
        return units.reduce((total, unit) => {
            return total + (unit.potionUsedInBattle || 0);
        }, 0);
    }

    /**
     * Deduct potions from inventory after battle.
     * @param {number} userId - User ID.
     * @param {number} totalUsed - Total amount used.
     */
    async deductPotions(userId, totalUsed) {
        if (totalUsed <= 0) return;
        
        try {
            await consumableService.consumeItem(userId, consumableService.ITEM_IDS.HEALTH_POTION, totalUsed);
            this.log(`Deducted ${totalUsed} Health Potion(s) from user ${userId}`, "POTION");
        } catch (error) {
            this.log(`Failed to deduct potions: ${error.message}`, "POTION_ERROR");
        }
    }
}

module.exports = new BattleConsumableService();
