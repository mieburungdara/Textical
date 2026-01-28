const BaseTrait = require('../BaseTrait');

class GiantTrait extends BaseTrait {
    constructor() { super('giant'); }

    onBattleStart(unit, sim) {
        unit.stats.health_max = Math.floor(unit.stats.health_max * 1.5);
        unit.currentHealth = unit.stats.health_max;
        unit.stats.speed = Math.max(1, unit.stats.speed - 5);
        sim.logger.addEvent("VFX", `${unit.data.name} towers over the field!`, { actor_id: unit.instanceId, vfx: "growth" });
    }
}

module.exports = GiantTrait;
