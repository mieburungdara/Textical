const BaseTrait = require('../BaseTrait');

class SkeletonTrait extends BaseTrait {
    constructor() { super('skeleton'); }

    onTurnStart(unit, sim) {
        // Natural immunity to status DoTs
        unit.activeEffects = unit.activeEffects.filter(e => e.type !== "POISON" && e.type !== "BURN");
    }

    onBeforeDeath(unit, sim) {
        // 20% chance to revive with 1 HP
        if (!unit.data.did_revive && Math.random() < 0.20) {
            unit.currentHealth = 1;
            unit.data.did_revive = true;
            sim.logger.addEvent("VFX", `${unit.data.name} refused to die!`, { actor_id: unit.instanceId, vfx: "revive" });
            return true; 
        }
        return false;
    }
}

module.exports = SkeletonTrait;
