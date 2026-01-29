const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * IsStunned: Checks if unit has STUN effect.
 */
const IsStunned = b3.Class(LogicGate);

IsStunned.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'IsStunned';
}

IsStunned.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const isStunned = unit.activeEffects.some(e => e.type === "STUN");

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking Stun status. Result: ${isStunned}`);
    return this.executePath(tick, isStunned);
}

module.exports = IsStunned;
