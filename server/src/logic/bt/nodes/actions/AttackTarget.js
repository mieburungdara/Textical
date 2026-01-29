const b3 = require('behavior3js');

const AttackTarget = b3.Class(b3.Action);

AttackTarget.prototype.initialize = function(params = {}) {
    b3.Action.prototype.initialize.call(this, params);
    this.name = 'AttackTarget';
    this.title = params.title || 'AttackTarget';
}

AttackTarget.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const target = sim.ai.findTarget(unit);
    if (!target) return b3.FAILURE;
    
    sim.rules.performAttack(unit, target);
    return b3.SUCCESS;
}

module.exports = AttackTarget;