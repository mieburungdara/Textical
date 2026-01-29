const BaseTrait = require('../BaseTrait');

class SharpshooterTrait extends BaseTrait {
    constructor() { super('sharpshooter'); }

    onBattleStart(unit, sim) {
        // AAA: Permanent range extension
        const bonusRange = 3;
        unit.stats.attack_range = (unit.stats.attack_range || 1) + bonusRange;
        
        sim.logger.addEvent("VFX", `${unit.data.name} focuses their vision (+${bonusRange} Range)`, { 
            actor_id: unit.instanceId,
            vfx: "eagle_eye" 
        });
    }
}

module.exports = SharpshooterTrait;
