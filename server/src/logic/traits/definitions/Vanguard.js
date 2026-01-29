const BaseTrait = require('../BaseTrait');

/**
 * Vanguard Trait (Knight/Warrior Specialization)
 * Protects adjacent allies by absorbing half of their damage.
 */
class VanguardTrait extends BaseTrait {
    constructor() { super('vanguard'); }

    /**
     * @param {BattleUnit} unit - The Protector
     * @param {BattleSimulation} sim - Context
     * @param {BattleUnit} ally - Unit taking damage
     * @param {number} amount - Damage amount
     */
    onAllyDamage(unit, sim, ally, amount) {
        if (unit.isDead || !ally || ally.isDead || !sim) return;

        const dist = sim.grid.getDistance(unit.gridPos, ally.gridPos);
        
        // If adjacent (within 1 tile)
        if (dist <= 1) {
            const absorbed = Math.floor(amount * 0.5);
            unit.takeDamage(absorbed, sim);
            
            sim.logger.addEvent("REACTION", `${unit.data.name} shields ${ally.data.name} with Vanguard stance!`, {
                actor_id: unit.instanceId,
                damage: absorbed
            });
        }
    }
}

module.exports = VanguardTrait;
