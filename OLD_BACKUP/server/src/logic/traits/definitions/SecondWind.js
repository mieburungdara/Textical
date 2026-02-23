const BaseTrait = require('../BaseTrait');

/**
 * Second Wind Trait
 * Restores a portion of HP once per battle when health drops below a critical threshold.
 */
class SecondWindTrait extends BaseTrait {
    constructor() {
        super('secondwind');
    }

    /**
     * @param {BattleUnit} unit - The unit with the trait
     * @param {BattleSimulation} sim - Context
     * @param {BattleUnit} attacker - The unit that dealt damage
     * @param {number} damage - The final damage amount
     */
    onPostHit(unit, sim, attacker, damage) {
        if (unit.isDead) return;
        
        // Initialize state if not present
        if (!unit._traitState) unit._traitState = {};
        if (!unit._traitState.secondWind) unit._traitState.secondWind = { used: false };

        if (unit._traitState.secondWind.used) return;

        const maxHP = unit.getStat("health_max");
        const hpPercent = unit.currentHealth / maxHP;

        // Get trait level
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'secondwind') || 
            (t && t.name && t.name.toLowerCase() === 'secondwind')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering: 
        // Lv1: Heal 20% if HP < 15%
        // Lv2: Heal 40% if HP < 25%
        // Lv3: Heal 60% if HP < 35%
        const thresholdMapping = { 1: 0.15, 2: 0.25, 3: 0.35 };
        const healPercentMapping = { 1: 0.20, 2: 0.40, 3: 0.60 };

        const threshold = thresholdMapping[level] || 0.15;
        const healPercent = healPercentMapping[level] || 0.20;

        if (hpPercent < threshold) {
            const healAmount = Math.floor(maxHP * healPercent);
            unit.currentHealth = Math.min(maxHP, unit.currentHealth + healAmount);
            unit._traitState.secondWind.used = true;

            sim.logger.addEvent("HEAL", `${unit.data.name} gets a second wind!`, {
                actor_id: unit.instanceId,
                amount: healAmount,
                level: level,
                hp_after_heal: unit.currentHealth
            });
        }
    }
}

module.exports = SecondWindTrait;
