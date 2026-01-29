const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * IsTargetInRange: Simple check for attack range.
 */
const IsTargetInRange = b3.Class(LogicGate);

IsTargetInRange.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'IsTargetInRange';
}

IsTargetInRange.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
    
    if (!target) return this.executePath(tick, false);
    
    const dist = sim.grid.getDistance(unit.gridPos, target.gridPos);
    const range = unit.stats.attack_range || 1;
    const inRange = dist <= range;

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} distance to ${target.data.name} is ${dist} (Range: ${range}). Result: ${inRange}`);
    
    return this.executePath(tick, inRange);
}

module.exports = IsTargetInRange;
