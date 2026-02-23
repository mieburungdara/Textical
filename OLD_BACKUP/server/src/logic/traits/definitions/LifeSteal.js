const BaseTrait = require('../BaseTrait');

class LifeStealTrait extends BaseTrait {
    constructor() { 
        super('lifesteal'); 
    }

    /**
     * Executes lifesteal logic based on damage dealt and trait level.
     * Applies the highest percentage between trait tier and unit base lifesteal stat.
     * @param {Object} attacker - The unit dealing damage.
     * @param {Object} sim - The battle simulation context.
     * @param {number} damage - The final damage amount to calculate healing from.
     */
    onLifesteal(attacker, sim, damage) {
        if (attacker.currentHealth <= 0 || attacker.isDead) return;

        if (damage > 0) {
            // Get trait level from attacker traits
            const traitObj = attacker.traits.find(t => 
                (typeof t === 'string' && t.toLowerCase() === 'lifesteal') || 
                (t && t.name && t.name.toLowerCase() === 'lifesteal')
            );
            
            // @type {number}
            const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

            // Tiered Percentages: Level 1 (15%), Level 2 (30%), Level 3 (50%)
            const tierMapping = { 1: 0.15, 2: 0.30, 3: 0.50 };
            const traitPercent = tierMapping[level] || 0.15;

            // Get stat-based lifesteal (from gear/passives)
            // Note: Stat value is expected to be a decimal (e.g., 0.1 for 10%)
            const statPercent = attacker.getStat("lifesteal_base") || 0;

            // Protocol: Highest Win
            const finalPercent = Math.max(traitPercent, statPercent);

            const heal = Math.floor(damage * finalPercent);
            
            if (heal > 0) {
                const maxHP = attacker.getStat("health_max");
                attacker.currentHealth = Math.min(maxHP, attacker.currentHealth + heal);
                
                sim.logger.addEvent("HEAL", `${attacker.data.name} leeches life (${Math.floor(finalPercent * 100)}%)`, { 
                    actor_id: attacker.instanceId, 
                    amount: heal,
                    level: level,
                    source_percent: traitPercent,
                    stat_percent: statPercent
                });
            }
        }
    }
}

module.exports = LifeStealTrait;
