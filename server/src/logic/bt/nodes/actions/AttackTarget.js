const b3 = require('behavior3js');

class AttackTarget extends b3.Action {
    constructor() { super({ name: 'AttackTarget' }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = sim.ai.findTarget(unit);
        if (!target) return b3.FAILURE;
        
        sim.rules.performAttack(unit, target);
        return b3.SUCCESS;
    }
}

module.exports = AttackTarget;
