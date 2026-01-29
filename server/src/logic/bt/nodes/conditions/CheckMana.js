const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * CheckMana: Checks if unit has enough Mana.
 * Properties:
 * - threshold: Ratio (0.0 to 1.0). SUCCESS if currentMana % >= threshold.
 */
const CheckMana = b3.Class(LogicGate);

CheckMana.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckMana';
}

CheckMana.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const threshold = this.properties.threshold || 0.2;
    const currentRatio = unit.currentMana / unit.stats.mana_max;
    const met = currentRatio >= threshold;

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} MP check: ${(currentRatio*100).toFixed(0)}% >= ${(threshold*100).toFixed(0)}%. Result: ${met}`);
    
    return this.executePath(tick, met);
}

module.exports = CheckMana;
