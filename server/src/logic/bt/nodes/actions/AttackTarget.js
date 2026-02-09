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
    const target = tick.blackboard.get('target') || sim.ai.findTarget(unit);
    
    if (!target || target.currentHealth <= 0) return b3.FAILURE;
    
    // AAA: Final BT Range Check
    const dist = sim.grid.getDistance(unit.gridPos, target.gridPos);
    const range = unit.stats.attack_range || 1.5;
    if (dist > range) {
        return b3.FAILURE; // Target moved, cancel attack at AI level
    }
    
    sim.rules.performAttack(unit, target);
    return b3.SUCCESS;
}

module.exports = AttackTarget;
