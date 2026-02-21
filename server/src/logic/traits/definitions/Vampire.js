const BaseTrait = require('../BaseTrait');

class VampireTrait extends BaseTrait {
    constructor() { 
        super('vampire'); 
    }

    onLifesteal(attacker, sim, damage) {
        if (attacker.currentHealth <= 0 || attacker.isDead) return;

        if (damage > 0) {
            const heal = Math.floor(damage * 0.30);
            const maxHP = attacker.getStat("health_max");
            attacker.currentHealth = Math.min(maxHP, attacker.currentHealth + heal);
            sim.logger.addEvent("HEAL", `${attacker.data.name} leeches life`, { actor_id: attacker.instanceId, amount: heal });
        }
    }
}

module.exports = VampireTrait;
