const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * IsLowHP: Checks if unit health is below 40%.
 */
const IsLowHP = b3.Class(LogicGate);

IsLowHP.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'IsLowHP';
}

IsLowHP.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const currentRatio = unit.currentHealth / unit.stats.health_max;
    const isLow = currentRatio < 0.4;

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking LowHP: ${(currentRatio*100).toFixed(0)}% (< 40%). Result: ${isLow}`);
    return this.executePath(tick, isLow);
}

module.exports = IsLowHP;
