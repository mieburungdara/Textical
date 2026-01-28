const BaseTrait = require('../BaseTrait');

class VampireTrait extends BaseTrait {
    constructor() { super('vampire'); }

    onLifesteal(attacker, damage, sim) {
        if (damage > 0) {
            const heal = Math.floor(damage * 0.30);
            attacker.currentHealth = Math.min(attacker.stats.health_max, attacker.currentHealth + heal);
            sim.logger.addEvent("HEAL", `${attacker.data.name} leeches life`, { actor_id: attacker.instanceId, amount: heal });
        }
    }
}

module.exports = VampireTrait;
