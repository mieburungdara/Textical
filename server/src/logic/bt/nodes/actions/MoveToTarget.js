const b3 = require('behavior3js');
const BaseMove = require('./BaseMove');

const MoveToTarget = b3.Class(BaseMove);

MoveToTarget.prototype.initialize = function(params = {}) {
    BaseMove.prototype.initialize.call(this, {
        name: 'MoveToTarget',
        title: params.title || 'Pursue Enemy',
        properties: params.properties
    });
}

MoveToTarget.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
    
    if (!target || target.isDead) return b3.FAILURE;

    // Execute movement using base class helper
    return this.stepTowards(unit, target.gridPos, sim);
}

module.exports = MoveToTarget;
