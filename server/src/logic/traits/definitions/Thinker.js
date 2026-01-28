const BaseTrait = require('../BaseTrait');

class ThinkerTrait extends BaseTrait {
    constructor() { super('thinker'); }

    onTurnStart(unit, sim) {
        const regen = 5;
        unit.currentMana = Math.min(unit.stats.mana_max, unit.currentMana + regen);
        sim.logger.addEvent("VFX", `${unit.data.name} is contemplating strategy...`, { actor_id: unit.instanceId, vfx: "mana_regen" });
    }
}

module.exports = ThinkerTrait;
