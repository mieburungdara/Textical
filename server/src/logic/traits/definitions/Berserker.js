const BaseTrait = require('../BaseTrait');

class BerserkerTrait extends BaseTrait {
    constructor() { super('berserker'); }

    onTurnStart(unit, sim) {
        const missingHpPercent = (unit.stats.health_max - unit.currentHealth) / unit.stats.health_max;
        const atkBonus = Math.floor(unit.stats.attack_damage * (missingHpPercent * 0.5));
        unit.temporaryStats.attack_damage = (unit.temporaryStats.attack_damage || 0) + atkBonus;
        return { temporaryDamageMult: 1.0 + (missingHpPercent * 0.2) };
    }
}

module.exports = BerserkerTrait;
