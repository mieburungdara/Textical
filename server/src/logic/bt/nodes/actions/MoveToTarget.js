const b3 = require('behavior3js');

class MoveToTarget extends b3.Action {
    constructor() { super({ name: 'MoveToTarget' }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        // Try to get target from blackboard first
        let target = tick.blackboard.get('target', tick.tree.id, unit.instanceId);
        
        // Fallback to finding closest enemy if no specific target set
        if (!target) {
            target = sim.ai.findTarget(unit);
        }

        if (!target) return b3.FAILURE;
        
        sim.ai.moveTowards(unit, target);
        return b3.SUCCESS;
    }
}

module.exports = MoveToTarget;
