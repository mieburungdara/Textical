/**
 * BattleRegistry (Stub)
 * This file should be fully implemented for potion system support
 */

class BattleRegistry {
    constructor() {
        this.battles = new Map();
        this.potionCooldowns = new Map();
    }

    registerBattle(battleId, battleData) {
        this.battles.set(battleId, battleData);
    }

    getBattle(battleId) {
        return this.battles.get(battleId);
    }

    useHealthPotion(battleId, userId) {
        // Stub implementation
        return { success: true, message: "Potion used" };
    }

    isPotionOnCooldown(battleId, userId) {
        return false;
    }
}

module.exports = new BattleRegistry();
