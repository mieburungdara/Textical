const LogicGate = require('./LogicGate');

/**
 * CheckTerrain: Mengecek tipe ubin (terrain) tempat unit berdiri.
 * Properties:
 * - terrainType: 'FOREST', 'MOUNTAIN', 'MINE', 'WATER', dll.
 */
class CheckTerrain extends LogicGate {
    constructor(params) { super({ name: 'CheckTerrain', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const requiredType = this.properties.terrainType;
        
        // Sim biasanya punya referensi ke regionType saat ini
        const currentTerrain = sim.regionType || 'FOREST';
        
        return this.executePath(tick, currentTerrain === requiredType);
    }
}

module.exports = CheckTerrain;
