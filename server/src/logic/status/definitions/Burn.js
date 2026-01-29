const BaseStatus = require('../BaseStatus');

class BurnStatus extends BaseStatus {
    constructor(duration, power) {
        super('BURN', duration, power);
    }

    onTick(unit, sim) {
        const damage = this.power || 5;
        unit.takeDamage(damage);
        sim.logger.addEvent("DAMAGE", `${unit.data.name} suffers from deep burns`, { 
            target_id: unit.instanceId, 
            damage: damage,
            type: "BURN"
        });
    }
}

module.exports = BurnStatus;
