const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * CheckTerrain: Checks if the unit is standing on a specific terrain type.
 */
const CheckTerrain = b3.Class(LogicGate);

CheckTerrain.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckTerrain';
}

CheckTerrain.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const requiredType = (this.properties.terrainType || 'FOREST').toUpperCase();
    const currentTerrain = (sim.regionType || 'FOREST').toUpperCase();
    const met = currentTerrain === requiredType;

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} on ${currentTerrain}. Req: ${requiredType}. Result: ${met}`);
    
    return this.executePath(tick, met);
}

module.exports = CheckTerrain;
