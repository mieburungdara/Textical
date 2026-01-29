const LogicGate = require('./LogicGate');

class CheckTerrain extends LogicGate {
    constructor(params) { super({ name: 'CheckTerrain', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const requiredType = this.properties.terrainType;
        const currentTerrain = sim.regionType || 'FOREST';
        const met = currentTerrain === requiredType;

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} standing on ${currentTerrain}. Required: ${requiredType}. Result: ${met}`);
        
        return this.executePath(tick, met);
    }
}

module.exports = CheckTerrain;