const BaseTrait = require('../BaseTrait');

/**
 * Counter Strike Trait
 * Chance to counter-attack when hit by an enemy within range.
 * Tiered Scaling:
 * Lv1: 15% chance
 * Lv2: 30% chance
 * Lv3: 50% chance
 */
class CounterStrikeTrait extends BaseTrait {
    constructor() {
        super('counterstrike');
    }

    /**
     * onPostHit: Triggered immediately after unit takes damage.
     * @param {BattleUnit} defender - Owner of this trait
     * @param {BattleSimulation} sim - Context
     * @param {BattleUnit} attacker - The unit that hit
     * @param {number} damage - Damage taken
     */
    onPostHit(defender, sim, attacker, damage) {
        // Don't counter if self or attacker is dead
        if (defender.currentHealth <= 0 || defender.isDead || !attacker || attacker.currentHealth <= 0 || attacker.isDead) return;

        // Get trait level
        const traitObj = defender.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'counterstrike') || 
            (t && t.name && t.name.toLowerCase() === 'counterstrike')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering
        const chanceMapping = { 1: 0.15, 2: 0.30, 3: 0.50 };
        const counterChance = chanceMapping[level] || 0.15;

        // Check chance
        if (Math.random() < counterChance) {
            const dist = sim.grid.getDistance(defender.gridPos, attacker.gridPos);
            const range = defender.getStat("attack_range") || 1;

            // Only counter if enemy is within range
            if (dist <= (range + 0.2)) {
                sim.logger.addEvent("REACTION", `${defender.data.name} counters ${attacker.data.name}!`, {
                    actor_id: defender.instanceId,
                    vfx: "counter_slash"
                });
                
                // Execute counter-attack using standard rules as a reaction
                sim.rules.performAttack(defender, attacker, true);
            }
        }
    }
}

module.exports = CounterStrikeTrait;
