const b3 = require('behavior3js');

/**
 * AttackTarget: Performs a physical attack on the target stored in memory.
 */
const AttackTarget = b3.Class(b3.Action);

AttackTarget.prototype.initialize = function(params = {}) {
    b3.Action.prototype.initialize.call(this, params);
    this.name = 'AttackTarget';
}

AttackTarget.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    // Global scope target
    const target = tick.blackboard.get('target') || sim.ai.findTarget(unit);
    
    if (!target || target.currentHealth <= 0) return b3.FAILURE;
    
    sim.rules.performAttack(unit, target);
    return b3.SUCCESS;
}

module.exports = AttackTarget;
