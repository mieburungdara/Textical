const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * CheckAllyCount: Mengecek jumlah teman yang masih hidup.
 */
const CheckAllyCount = b3.Class(LogicGate);

CheckAllyCount.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckAllyCount';
}

CheckAllyCount.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const units = sim.units || [];
    const allies = units.filter(u => u && u.teamId === unit.teamId && u.currentHealth > 0 && u.instanceId !== unit.instanceId);
    
    const threshold = this.properties.minCount || 1;
    const operator = this.properties.comparison || this.properties.operator || '>=';
    
    let met = false;
    switch(operator) {
        case '>': met = allies.length > threshold; break;
        case '<': met = allies.length < threshold; break;
        case '==': met = allies.length === threshold; break;
        case '>=': met = allies.length >= threshold; break;
        case '<=': met = allies.length <= threshold; break; // FIXED: Added missing operator
    }
    
    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking allies: ${allies.length} ${operator} ${threshold}. Result: ${met}`);
    return this.executePath(tick, met);
}

module.exports = CheckAllyCount;
