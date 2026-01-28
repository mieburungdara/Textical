const BaseTrait = require('../BaseTrait');

class GlassCannonTrait extends BaseTrait {
    constructor() { super('glass_cannon'); }

    onBattleStart(unit, sim) {
        unit.stats.attack_damage *= 1.8;
        unit.stats.health_max = Math.floor(unit.stats.health_max * 0.4);
        unit.currentHealth = unit.stats.health_max;
        sim.logger.addEvent("EMOTE", `${unit.data.name} focuses purely on offense!`, { actor_id: unit.instanceId });
    }
}

module.exports = GlassCannonTrait;
