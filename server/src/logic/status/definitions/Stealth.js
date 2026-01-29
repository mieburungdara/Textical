const BaseStatus = require('../BaseStatus');

class StealthStatus extends BaseStatus {
    constructor(duration) {
        super('STEALTH', duration, 0);
    }

    onApply(unit, sim) {
        unit.isStealthed = true;
        sim.logger.addEvent("VFX", `${unit.data.name} vanishes into the shadows!`, { 
            actor_id: unit.instanceId,
            vfx: "stealth_cloud"
        });
    }

    onExpire(unit, sim) {
        unit.isStealthed = false;
        sim.logger.addEvent("VFX", `${unit.data.name} is revealed!`, { 
            actor_id: unit.instanceId,
            vfx: "stealth_break"
        });
    }
}

module.exports = StealthStatus;
