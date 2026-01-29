const BaseTrait = require('../BaseTrait');

class TrueSightTrait extends BaseTrait {
    constructor() { super('truesight'); }

    // This trait is a flag used by BattleAI.findTarget
    // No specific hooks needed, but we can add an emoji/VFX
    onBattleStart(unit, sim) {
        sim.logger.addEvent("VFX", `${unit.data.name} possesses the Gaze of Truth.`, { 
            actor_id: unit.instanceId,
            vfx: "true_sight_eye" 
        });
    }
}

module.exports = TrueSightTrait;
