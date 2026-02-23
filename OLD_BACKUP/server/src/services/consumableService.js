const combatConsumableService = require('./consumable/CombatConsumableService');
const worldConsumableService = require('./consumable/WorldConsumableService');
const { ERROR_CODES, CONSUMABLE_CONSTANTS, TICK_UTILS } = require('./consumable/ConsumableConstants');

/**
 * ConsumableService Facade
 * This service now delegates all implementation details to specialized sub-services.
 * - Combat-related consumables go to CombatConsumableService
 * - World-related consumables (buffs, permanent stats) go to WorldConsumableService
 */
class ConsumableService {
    static get ERROR_CODES() { return ERROR_CODES; }
    static get CONSTANTS() { return CONSUMABLE_CONSTANTS; }

    /**
     * Use Health Potion during combat
     * Delegated to CombatConsumableService
     */
    async useHealthPotionInCombat(userId, heroId, battleId) {
        return combatConsumableService.useHealthPotionInCombat(userId, heroId, battleId);
    }

    /**
     * Use a consumable item instance from inventory
     * Delegated to WorldConsumableService
     */
    async useItemInstance(userId, heroId, itemInstanceId) {
        return worldConsumableService.useItemInstance(userId, heroId, itemInstanceId);
    }

    /**
     * Consume an item by template ID (legacy support)
     * Delegated to WorldConsumableService
     */
    async consumeItem(userId, heroId, templateId) {
        return worldConsumableService.consumeItem(userId, heroId, templateId);
    }
}

// Export singleton and shared utilities
module.exports = new ConsumableService();
module.exports.ERROR_CODES = ERROR_CODES;
module.exports.CONSUMABLE_CONSTANTS = CONSUMABLE_CONSTANTS;
module.exports.TICK_UTILS = TICK_UTILS;

