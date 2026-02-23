const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * CheckSkillReady: Checks if a specific skill is off cooldown.
 */
const CheckSkillReady = b3.Class(LogicGate);

CheckSkillReady.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckSkillReady';
}

CheckSkillReady.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const skillId = this.properties.skillId;
    
    if (!skillId) return this.executePath(tick, false);
    
    const cooldown = unit.skillCooldowns[skillId] || 0;
    const met = cooldown <= 0;

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking skill ${skillId} CD: ${cooldown}. Ready: ${met}`);
    
    return this.executePath(tick, met);
}

module.exports = CheckSkillReady;
