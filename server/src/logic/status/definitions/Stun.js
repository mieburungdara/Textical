const BaseStatus = require('../BaseStatus');

class StunStatus extends BaseStatus {
    constructor(duration) {
        super('STUN', duration, 0);
    }

    onApply(unit, sim) {
        sim.logger.addEvent("VFX", `${unit.data.name} is dazed and STUNNED!`, { 
            actor_id: unit.instanceId,
            vfx: "stun_spiral"
        });
    }

    onExpire(unit, sim) {
        sim.logger.addEvent("ENGINE", `${unit.data.name} recovered from Stun.`);
    }
}

module.exports = StunStatus;
