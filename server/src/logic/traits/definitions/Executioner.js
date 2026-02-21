const BaseTrait = require('../BaseTrait');

/**
 * Executioner Trait
 * Increases damage dealt to low-health targets.
 */
class ExecutionerTrait extends BaseTrait {
    constructor() {
        super('executioner');
    }

    /**
     * @param {BattleUnit} attacker - The unit dealing damage
     * @param {BattleSimulation} sim - Context
     * @param {BattleUnit} target - The unit being attacked
     * @returns {Object}
     */
    onPreAttack(attacker, sim, target) {
        if (!target || target.isDead) return {};

        const targetMaxHP = target.getStat("health_max");
        const targetHPPercent = target.currentHealth / targetMaxHP;

        // Get trait level
        const traitObj = attacker.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'executioner') || 
            (t && t.name && t.name.toLowerCase() === 'executioner')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering: 
        // Lv1: +20% DMG if target <30% HP
        // Lv2: +40% DMG if target <40% HP
        // Lv3: +60% DMG if target <50% HP
        const thresholdMapping = { 1: 0.30, 2: 0.40, 3: 0.50 };
        const bonusMapping = { 1: 0.20, 2: 0.40, 3: 0.60 };

        const threshold = thresholdMapping[level] || 0.30;
        const bonus = bonusMapping[level] || 0.20;

        if (targetHPPercent < threshold) {
            const dmgMult = 1.0 + bonus;
            sim.logger.addEvent("TRAIT", `${attacker.data.name} prepares for execution (x${dmgMult.toFixed(2)})!`, {
                actor_id: attacker.instanceId,
                target_id: target.instanceId,
                level: level,
                target_hp_percent: (targetHPPercent * 100).toFixed(0),
                threshold: (threshold * 100).toFixed(0)
            });
            return { dmgMult: dmgMult };
        }

        return {};
    }
}

module.exports = ExecutionerTrait;
