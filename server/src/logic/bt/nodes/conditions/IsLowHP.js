const LogicGate = require('./LogicGate');

class IsLowHP extends LogicGate {
    constructor(params) { super({ name: 'IsLowHP', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const currentRatio = unit.currentHealth / unit.stats.health_max;
        const isLow = currentRatio < 0.4;

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking LowHP: ${(currentRatio*100).toFixed(0)}% (< 40%). Result: ${isLow}`);
        return this.executePath(tick, isLow);
    }
}

module.exports = IsLowHP;