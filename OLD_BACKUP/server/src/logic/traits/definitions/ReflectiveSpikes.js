const BaseTrait = require('../BaseTrait');

/**
 * Reflective Spikes Trait
 * Reflects a portion of damage taken back to the attacker as true damage.
 */
class ReflectiveSpikesTrait extends BaseTrait {
    constructor() {
        super('reflectivespikes');
    }

    /**
     * @param {BattleUnit} unit - The unit with the trait (defender)
     * @param {BattleSimulation} sim - Context
     * @param {BattleUnit} attacker - The unit that dealt damage
     * @param {number} amount - The final damage amount
     * @returns {Object}
     */
    onTakeDamage(unit, sim, attacker, amount) {
        if (!attacker || attacker.isDead || attacker === unit || amount <= 0) return {};

        // Get trait level
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'reflectivespikes') || 
            (t && t.name && t.name.toLowerCase() === 'reflectivespikes')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering: Lv1 (15%), Lv2 (30%), Lv3 (50%)
        const reflectPercentMapping = { 1: 0.15, 2: 0.30, 3: 0.50 };
        const reflectPercent = reflectPercentMapping[level] || 0.15;

        const reflectedDamage = Math.floor(amount * reflectPercent);

        if (reflectedDamage > 0) {
            return { reflectPercent: reflectPercent };
        }

        return {};
    }
}

module.exports = ReflectiveSpikesTrait;
