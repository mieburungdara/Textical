const LogicGate = require('./LogicGate');

class IsTargetInRange extends LogicGate {
    constructor(params) { super({ name: 'IsTargetInRange', children: params.children }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = sim.ai.findTarget(unit);
        if (!target) return this.executePath(tick, false);
        
        const dist = sim.grid.getDistance(unit.gridPos, target.gridPos);
        const range = unit.stats.attack_range || 1;
        
        return this.executePath(tick, dist <= range);
    }
}

module.exports = IsTargetInRange;
