const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * CheckTargetStatus: Checks if the CURRENT TARGET has a specific effect.
 */
const CheckTargetStatus = b3.Class(LogicGate);

CheckTargetStatus.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckTargetStatus';
}

CheckTargetStatus.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
    
    if (!target) return this.executePath(tick, false);
    
    const effectType = (this.properties.effectType || 'BURN').toUpperCase();
    const hasEffect = target.activeEffects.some(e => e.type === effectType);

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking target ${target.data.name} for ${effectType}. Result: ${hasEffect}`);
    
    return this.executePath(tick, hasEffect);
}

module.exports = CheckTargetStatus;
