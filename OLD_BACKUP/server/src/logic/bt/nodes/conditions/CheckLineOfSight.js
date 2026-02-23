const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * CheckLineOfSight: Mengecek apakah jalur pandang ke target bersih (tidak terhalang tembok/objek).
 */
const CheckLineOfSight = b3.Class(LogicGate);

CheckLineOfSight.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckLineOfSight';
}

CheckLineOfSight.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
    
    if (!target) return this.executePath(tick, false);
    
    // AAA: Logic menggunakan fungsi Line-of-Sight dari grid
    const isClear = sim.grid.hasLineOfSight ? sim.grid.hasLineOfSight(unit.gridPos, target.gridPos) : true;

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking LOS to ${target.data.name}. Clear: ${isClear}`);
    
    return this.executePath(tick, isClear);
}

module.exports = CheckLineOfSight;