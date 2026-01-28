const BaseTrait = require('../BaseTrait');

class ThornsTrait extends BaseTrait {
    constructor() { super('thorns'); }

    onTakeDamage(defender, amount, sim) {
        if (amount > 5) {
            // Find the attacker (this is a reactive hook, we need the logic to pass attacker or find from current context)
            // For now, reflecting back to whoever dealt damage
            return { reflectPercent: 0.2 }; 
        }
        return {};
    }
}

module.exports = ThornsTrait;
