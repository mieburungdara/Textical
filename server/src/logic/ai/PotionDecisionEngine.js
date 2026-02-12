/**
 * PotionDecisionEngine - Encapsulates potion usage AI logic
 * Following SRP: Only responsible for potion-related AI decisions
 */

/**
 * PotionDecisionEngine - Handles potion usage decisions during battle
 */
class PotionDecisionEngine {
    /**
     * Create a PotionDecisionEngine
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.POTION_HP_THRESHOLD = config.hpThreshold || 0.35; // Use potion when HP < 35%
    }

    /**
     * Determine if the actor should use a health potion
     * @param {Object} actor - The unit attempting to use a potion
     * @param {Object} sim - The battle simulation context
     * @returns {boolean} True if potion should be used
     */
    shouldUsePotion(actor, sim) {
        // Only heroes can use potions
        if (!actor.heroId) return false;
        
        // Check if potion is ready (cooldown expired)
        if (!actor.isPotionReady(sim)) return false;
        
        // Check if HP is below threshold
        const maxHp = actor.getStat("health_max") || actor.stats.health_max || 100;
        const hpPercent = actor.currentHealth / maxHp;
        if (hpPercent >= this.POTION_HP_THRESHOLD) return false;
        
        // Check if potions are available in inventory snapshot
        if (!sim.potionSnapshot) return false;
        const remaining = actor.getPotionsRemaining(sim.potionSnapshot.healthPotions);
        if (remaining <= 0) return false;
        
        return true;
    }

    /**
     * Execute potion usage for an actor
     * @param {Object} actor - The unit using the potion
     * @param {Object} sim - The battle simulation context
     * @returns {number} The actual heal amount applied
     */
    executePotionUse(actor, sim) {
        const alchemyLevel = sim.userGuildAlchemyLevel || 0;
        const healAmount = actor.calculatePotionHeal(alchemyLevel);
        actor.usePotion(sim);
        const actualHeal = actor.applyHeal(healAmount, sim);
        
        return actualHeal;
    }

    /**
     * Get potion usage decision result
     * @param {Object} actor - The unit attempting to use a potion
     * @param {Object} sim - The battle simulation context
     * @returns {Object} Decision result with shouldUse and actualHeal (if used)
     */
    makeDecision(actor, sim) {
        const shouldUse = this.shouldUsePotion(actor, sim);
        
        if (!shouldUse) {
            return { shouldUse: false };
        }

        const actualHeal = this.executePotionUse(actor, sim);

        return {
            shouldUse: true,
            actualHeal,
            hpPercent: (actor.currentHealth / (actor.getStat("health_max") || actor.stats.health_max || 100)) * 100,
            potionUsed: true
        };
    }
}

module.exports = PotionDecisionEngine;
