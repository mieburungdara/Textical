const BaseTrait = require('../BaseTrait');

/**
 * Berserker Trait
 * Increases Attack Damage as the unit's health decreases.
 * Tiered Scaling:
 * Lv1: Atk bonus = Missing% * 0.25, DmgMult = 1.0 + (Missing% * 0.1)
 * Lv2: Atk bonus = Missing% * 0.50, DmgMult = 1.0 + (Missing% * 0.2)
 * Lv3: Atk bonus = Missing% * 1.00, DmgMult = 1.0 + (Missing% * 0.4)
 */
class BerserkerTrait extends BaseTrait {
    constructor() {
        super('berserker');
    }

    onTurnStart(unit, sim) {
        if (unit.isDead) return {};

        const maxHP = unit.getStat("health_max");
        const currentHP = unit.currentHealth;
        const missingHpPercent = (maxHP - currentHP) / maxHP;

        // Get trait level
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'berserker') || 
            (t && t.name && t.name.toLowerCase() === 'berserker')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering
        const atkBonusMapping = { 1: 0.25, 2: 0.50, 3: 1.00 };
        const dmgMultMapping = { 1: 0.10, 2: 0.20, 3: 0.40 };

        const atkBonusFactor = atkBonusMapping[level] || 0.25;
        const dmgMultFactor = dmgMultMapping[level] || 0.10;

        const baseAtk = unit.getStat("attack_damage");
        const atkBonus = Math.floor(baseAtk * (missingHpPercent * atkBonusFactor));
        
        // Reset and apply temporary stat bonus for this turn
        unit.temporaryStats.attack_damage = atkBonus;

        return { 
            temporaryDamageMult: 1.0 + (missingHpPercent * dmgMultFactor) 
        };
    }
}

module.exports = BerserkerTrait;
