const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

const CheckHealth = b3.Class(LogicGate);

CheckHealth.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckHealth';
}

CheckHealth.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const threshold = this.properties.threshold || 0.5;
    const currentRatio = unit.currentHealth / unit.stats.health_max;
    const met = currentRatio <= threshold;

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} HP check: ${(currentRatio*100).toFixed(0)}% <= ${(threshold*100).toFixed(0)}%. Result: ${met}`);
    return this.executePath(tick, met);
}

module.exports = CheckHealth;
