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
            // Get trait level from protector (unit)
            const traitObj = unit.traits.find(t => 
                (typeof t === 'string' && t.toLowerCase() === 'vanguard') || 
                (t && t.name && t.name.toLowerCase() === 'vanguard')
            );
            const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

            // Tiered Percentages: Level 1 (30%), Level 2 (50%), Level 3 (70%)
            const tierMapping = { 1: 0.30, 2: 0.50, 3: 0.70 };
            const absorbPercent = tierMapping[level] || 0.30;

            // Absorb percentage of the final damage
            const absorbed = Math.floor(amount * absorbPercent);
            const remaining = amount - absorbed;
            unit.takeDamage(absorbed, sim);
            
            sim.logger.addEvent("REACTION", `${unit.data.name} intercepts attack (${Math.floor(absorbPercent * 100)}%)!`, {
                actor_id: unit.instanceId,
                target_id: ally.instanceId,
                absorbed_damage: absorbed,
                level: level,
                absorb_percent: absorbPercent
            });

            return { intercepted: true, remainingDamage: remaining };
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
