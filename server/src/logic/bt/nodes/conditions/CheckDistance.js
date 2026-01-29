const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

const CheckDistance = b3.Class(LogicGate);

CheckDistance.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckDistance';
}

CheckDistance.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
    
    if (!target) return this.executePath(tick, false);
    
    const currentDist = sim.grid.getDistance(unit.gridPos, target.gridPos);
    const threshold = this.properties.distance || 1;
    const operator = this.properties.operator || '<=';
    
    let met = false;
    switch(operator) {
        case '>': met = currentDist > threshold; break;
        case '<': met = currentDist < threshold; break;
        case '>=': met = currentDist >= threshold; break;
        case '<=': met = currentDist <= threshold; break;
        case '==': met = currentDist === threshold; break;
    }
    
    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} distance to ${target.data.name}: ${currentDist} ${operator} ${threshold}. Result: ${met}`);
    return this.executePath(tick, met);
}

module.exports = CheckDistance;
