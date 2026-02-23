const BaseTrait = require('../BaseTrait');

/**
 * Thorns Trait
 * Reflects a portion of damage taken back to the attacker as true damage.
 * Tiered Scaling:
 * Lv1: 10% reflect if dmg > 10
 * Lv2: 20% reflect if dmg > 5
 * Lv3: 40% reflect if dmg > 0
 */
class ThornsTrait extends BaseTrait {
    constructor() {
        super('thorns');
    }

    onTakeDamage(defender, sim, attacker, amount) {
        if (!attacker || attacker.currentHealth <= 0) return {};

        // Get trait level
        const traitObj = defender.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'thorns') || 
            (t && t.name && t.name.toLowerCase() === 'thorns')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering
        const reflectMapping = { 1: 0.10, 2: 0.20, 3: 0.40 };
        const thresholdMapping = { 1: 10, 2: 5, 3: 0 };

        const reflectPercent = reflectMapping[level] || 0.10;
        const threshold = thresholdMapping[level] || 10;

        if (amount > threshold) {
            return { reflectPercent: reflectPercent }; 
        }
        return {};
    }
}

module.exports = ThornsTrait;
