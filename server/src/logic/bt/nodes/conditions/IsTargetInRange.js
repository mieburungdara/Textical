const LogicGate = require('./LogicGate');

class IsTargetInRange extends LogicGate {
    constructor(params) { super({ name: 'IsTargetInRange', children: params.children }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
        
        if (!target) {
            sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} skip Range check (No target)`);
            return this.executePath(tick, false);
        }
        
        const dist = sim.grid.getDistance(unit.gridPos, target.gridPos);
        const range = unit.stats.attack_range || 1;
        const inRange = dist <= range;

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} distance to ${target.data.name} is ${dist} (Range: ${range}). Result: ${inRange}`);
        
        return this.executePath(tick, inRange);
    }
}

module.exports = IsTargetInRange;