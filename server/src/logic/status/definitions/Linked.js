const BaseStatus = require('../BaseStatus');

class LinkedStatus extends BaseStatus {
    constructor(duration, originId) { 
        super('LINKED', duration, 0); 
        this.originId = originId;
    }
    onApply(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} is linked to a protector!`, { target_id: unit.instanceId });
    }
}
module.exports = LinkedStatus;
