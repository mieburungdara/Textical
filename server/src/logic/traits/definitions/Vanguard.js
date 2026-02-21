const BaseTrait = require('../BaseTrait');

/**
 * Vanguard Trait (Knight/Warrior Specialization)
 * Protects adjacent allies by absorbing half of their damage.
 */
class VanguardTrait extends BaseTrait {
    constructor() { super('vanguard'); }

    /**
     * @param {BattleUnit} unit - The Protector (Vanguard)
     * @param {BattleSimulation} sim - Context
     * @param {BattleUnit} ally - Unit being attacked
     * @param {BattleUnit} attacker - The enemy attacking
     * @param {number} amount - Final damage after ally's defense
     * @returns {Object|null}
     */
    onInterceptDamage(unit, sim, ally, attacker, amount) {
        if (unit.isDead || !ally || ally.isDead || !sim) return null;

        const dist = sim.grid.getDistance(unit.gridPos, ally.gridPos);
        
        // If adjacent (within 1 tile)
        if (dist <= 1) {
            // Absorb 100% of the final damage
            unit.takeDamage(amount, sim);
            
            sim.logger.addEvent("REACTION", `${unit.data.name} intercepts attack for ${ally.data.name}!`, {
                actor_id: unit.instanceId,
                target_id: ally.instanceId,
                damage: amount
            });

            return { intercepted: true };
        }
        return null;
    }

    /**
     * Kept for notification logic if needed, but primary absorption is now in onInterceptDamage.
     */
    onAllyDamage(unit, sim, ally, amount) {
        // Logically we don't need to do anything here if it was already intercepted (amount will be 0)
    }
}

module.exports = VanguardTrait;
