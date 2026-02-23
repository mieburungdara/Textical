const BaseStatus = require('../BaseStatus');

class WetStatus extends BaseStatus {
    constructor(duration) { super('WET', duration, 0); }
    onApply(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} is soaked! (Lightning Weakness)`, { target_id: unit.instanceId });
    }
}
module.exports = WetStatus;
