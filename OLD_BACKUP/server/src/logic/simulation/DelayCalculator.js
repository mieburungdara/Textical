/**
 * DelayCalculator (v1.0)
 * Calculates recovery time (in ticks) for various combat actions.
 * Factors in Speed, Attack Speed, and Move Speed multipliers.
 */
class DelayCalculator {
    constructor() {
        // Base costs in ticks (Standard Speed 100)
        this.BASE_MOVE_COST = 20; // Reduced from 50 to allow faster engagement
        this.BASE_ATTACK_COST = 100;
        this.BASE_SKILL_COST = 100; // Default, can be overridden by skill metadata
    }

    /**
     * Calculates delay for units that are idle or waiting.
     */
    calculateIdleDelay(unit) {
        return 10; // Baseline wait time to prevent tick-churning
    }

    /**
     * Calculates the recovery delay for a MOVE action.
     * @param {Object} unit - The unit performing the action.
     * @returns {number} Ticks to wait.
     */
    calculateMoveDelay(unit) {
        const moveSpeed = unit.getStat("move_speed") || 100; // 100 = 1.0x
        const multiplier = 100 / Math.max(10, moveSpeed);
        return Math.floor(this.BASE_MOVE_COST * multiplier);
    }

    /**
     * Calculates the recovery delay for an ATTACK action.
     * @param {Object} unit - The unit performing the action.
     * @returns {number} Ticks to wait.
     */
    calculateAttackDelay(unit) {
        const attackSpeed = unit.getStat("attack_speed") || 1.0; // 1.0 = 100%
        // Higher attack speed reduces delay
        const multiplier = 1 / Math.max(0.1, attackSpeed);
        return Math.floor(this.BASE_ATTACK_COST * multiplier);
    }

    /**
     * Calculates the recovery delay for a SKILL action.
     * @param {Object} unit - The unit performing the action.
     * @param {Object} skill - Skill metadata.
     * @returns {number} Ticks to wait.
     */
    calculateSkillDelay(unit, skill = {}) {
        const baseCost = skill.actionCost || this.BASE_SKILL_COST;
        const castingSpeed = unit.getStat("casting_speed") || unit.getStat("dex") || 10;
        
        // Casting Speed logic: Every 10 DEX reduces cost by 5%
        const discount = Math.min(0.5, (castingSpeed / 10) * 0.05);
        return Math.floor(baseCost * (1 - discount));
    }
}

module.exports = new DelayCalculator();
