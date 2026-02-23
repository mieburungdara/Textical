const traitService = require('../../services/traitService');

class UnitPotionHandler {
    unit;
    potionCooldownReadyAt = 0;
    potionUsedInBattle = 0;
    CONFIG;

    constructor(unit) {
        this.unit = unit;
        this.potionCooldownReadyAt = 0;
        this.potionUsedInBattle = 0;
        
        this.CONFIG = {
            HEALTH_POTION_ID: 2001,
            BASE_HEAL_AMOUNT: 50,
            COOLDOWN_TICKS: 10,
            ALCHEMY_LAB_BONUS_PER_LEVEL: 0.03
        };
    }

    /**
     * Check if potion is ready.
     * @param {BattleSimulation} sim - Battle simulation instance.
     * @returns {boolean}
     */
    isReady(sim) {
        if (!sim) return false;
        return sim.currentTick >= this.potionCooldownReadyAt;
    }

    /**
     * Get remaining cooldown ticks.
     * @param {BattleSimulation} sim - Battle simulation instance.
     * @returns {number}
     */
    getCooldownRemaining(sim) {
        if (!sim) return 0;
        const remaining = this.potionCooldownReadyAt - sim.currentTick;
        return remaining > 0 ? remaining : 0;
    }

    /**
     * Use potion.
     * @param {BattleSimulation} sim - Battle simulation instance.
     */
    usePotion(sim) {
        if (!sim) return;
        this.potionCooldownReadyAt = sim.currentTick + this.CONFIG.COOLDOWN_TICKS;
        this.potionUsedInBattle++;
        
        if (sim.logger) {
            sim.logger.addEvent("POTION_USE", `${this.unit.data.name} used Health Potion`, {
                unitId: this.unit.instanceId,
                potionId: this.CONFIG.HEALTH_POTION_ID,
                tick: sim.currentTick,
                usesInBattle: this.potionUsedInBattle,
                cooldownExpiresAt: this.potionCooldownReadyAt
            });
        }
    }

    /**
     * Calculate heal amount with bonuses.
     * @param {number} alchemyLabLevel - Guild Alchemy Lab level.
     * @returns {number} Final heal amount.
     */
    calculateHeal(alchemyLabLevel = 0) {
        const bonusMultiplier = alchemyLabLevel * this.CONFIG.ALCHEMY_LAB_BONUS_PER_LEVEL;
        return Math.floor(this.CONFIG.BASE_HEAL_AMOUNT * (1 + bonusMultiplier));
    }

    /**
     * Apply burst heal to the unit.
     * @param {number} amount - Heal amount.
     * @param {BattleSimulation} sim - Battle simulation instance.
     * @returns {number} Actual heal amount.
     */
    applyHealToUnit(amount, sim) {
        const maxHp = this.unit.getStat("health_max") || this.unit.stats.health_max || 100;
        const oldHp = this.unit.currentHealth;
        this.unit.currentHealth = Math.min(maxHp, this.unit.currentHealth + amount);
        const actualHeal = this.unit.currentHealth - oldHp;
        
        if (sim && sim.logger) {
            sim.logger.addEvent("HEAL", `${this.unit.data.name} healed for ${actualHeal} HP`, {
                targetId: this.unit.instanceId,
                amount: actualHeal,
                isPotion: true,
                tick: sim.currentTick
            });
        }
        
        if (actualHeal > 0 && sim) {
            traitService.executeHook("onHealthGain", this.unit, actualHeal, sim);
        }
        
        return actualHeal;
    }

    /**
     * Get remaining potions count.
     * @param {number} inventoryQuantity - Total in inventory.
     * @returns {number}
     */
    getRemaining(inventoryQuantity) {
        return Math.max(0, inventoryQuantity - this.potionUsedInBattle);
    }
}

module.exports = UnitPotionHandler;
