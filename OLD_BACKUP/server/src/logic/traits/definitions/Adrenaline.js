const BaseTrait = require('../BaseTrait');

/**
 * Adrenaline Trait
 * Increases damage dealt as the unit's health decreases.
 */
class AdrenalineTrait extends BaseTrait {
    constructor() {
        super('adrenaline');
    }

    /**
     * @param {BattleUnit} attacker - The unit dealing damage
     * @param {BattleSimulation} sim - Context
     * @param {BattleUnit} target - The unit being attacked
     * @returns {Object}
     */
    onPreAttack(attacker, sim, target) {
        if (attacker.isDead) return {};

        const maxHP = attacker.getStat("health_max");
        const currentHP = attacker.currentHealth;
        const hpPercent = currentHP / maxHP;
        const missingHpPercent = 1.0 - hpPercent;

        // Get trait level
        const traitObj = attacker.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'adrenaline') || 
            (t && t.name && t.name.toLowerCase() === 'adrenaline')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering: Lv1 (0.5% per 1%), Lv2 (1.0% per 1%), Lv3 (2.0% per 1%)
        const perPercentBonus = { 1: 0.5, 2: 1.0, 3: 2.0 };
        const factor = perPercentBonus[level] || 0.5;

        // Calculate bonus: missingHpPercent * 100 * factor / 100
        // e.g. Lv1 at 50% HP (50% missing): 50 * 0.5 = 25% bonus -> 1.25 multiplier
        const dmgMult = 1.0 + (missingHpPercent * factor);

        if (dmgMult > 1.0) {
            sim.logger.addEvent("TRAIT", `${attacker.data.name} adrenaline surges (x${dmgMult.toFixed(2)})!`, {
                actor_id: attacker.instanceId,
                level: level,
                hp_percent: (hpPercent * 100).toFixed(0),
                bonus_dmg: ((dmgMult - 1.0) * 100).toFixed(0)
            });
        }

        return { dmgMult: dmgMult };
    }
}

module.exports = AdrenalineTrait;
