const BaseService = require('../BaseService');
const inventoryService = require('../inventoryService');

class LootDistributor extends BaseService {
    /**
     * Distribute loot from monster kill.
     * @param {number} userId - User ID.
     * @param {Object} monsterTemplate - Monster template with loot.
     * @param {number} lootChanceModifier - Modifier from ecosystem and danger level.
     * @param {boolean} isNight - Night time flag for cursed items.
     * @param {string} zoneType - Zone type context.
     * @returns {Promise<Array>} Earned loot list.
     */
    async distributeLoot(userId, monsterTemplate, lootChanceModifier, isNight, zoneType) {
        const lootEarned = [];
        
        if (!monsterTemplate || !monsterTemplate.loot) return lootEarned;

        for (const entry of monsterTemplate.loot) {
            const effectiveChance = entry.chance * lootChanceModifier;
            if (Math.random() < effectiveChance) {
                try {
                    let options = {};
                    if (isNight && Math.random() < 0.10) {
                        options.isCursed = true;
                    }
                    if (zoneType === 'BLACK') {
                        options.isSoulbound = true;
                    }
                    
                    await inventoryService.addItem(userId, entry.itemId, 1, null, options);
                    lootEarned.push({ 
                        templateId: entry.itemId, 
                        quantity: 1,
                        isCursed: options.isCursed || false 
                    });
                } catch (e) { /* Inventory full - could log or notify */ }
            }
        }

        return lootEarned;
    }

    /**
     * Process gold reward.
     * @param {number} userId - User ID.
     * @param {number} rawGold - Raw gold from battle.
     * @param {number} goldMultiplier - Multiplier from danger level.
     * @returns {Promise<number>} Final gold rewarded.
     */
    async distributeGold(userId, rawGold, goldMultiplier) {
        if (rawGold <= 0) return 0;
        
        const goldReward = Math.floor(rawGold * goldMultiplier);
        const transactionManager = require('../economy/TransactionManager');
        
        await this.runTransaction(async (tx) => {
            await transactionManager.addCurrency(tx, userId, goldReward, "BATTLE_REWARD");
        });

        return goldReward;
    }
}

module.exports = new LootDistributor();
