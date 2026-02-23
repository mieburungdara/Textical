const BaseStatus = require('../BaseStatus');

class LeadenStatus extends BaseStatus {
    constructor(duration) { super('LEADEN', duration, 0); }
    onApply(unit, sim) {
        unit.temporaryStats.speed = (unit.temporaryStats.speed || 0) - (unit.stats.speed * 0.5);
        sim.logger.addEvent("STATUS", `${unit.data.name}'s limbs feel heavy (SPD -50%)`, { target_id: unit.instanceId });
    }
}
module.exports = LeadenStatus;
