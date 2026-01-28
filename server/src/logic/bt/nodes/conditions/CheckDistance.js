const LogicGate = require('./LogicGate');

/**
 * CheckDistance: Mengecek jarak ke target saat ini.
 * Properties:
 * - distance: Angka ubin yang ingin dicek.
 * - operator: '>', '<', '>=', '<=', '=='
 */
class CheckDistance extends LogicGate {
    constructor(params) { super({ name: 'CheckDistance', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
        
        if (!target) return this.executePath(tick, false);
        
        const currentDist = sim.grid.getDistance(unit.gridPos, target.gridPos);
        const threshold = this.properties.distance || 1;
        const operator = this.properties.operator || '<=';
        
        let met = false;
        switch(operator) {
            case '>': met = currentDist > threshold; break;
            case '<': met = currentDist < threshold; break;
            case '>=': met = currentDist >= threshold; break;
            case '<=': met = currentDist <= threshold; break;
            case '==': met = currentDist === threshold; break;
        }
        
        return this.executePath(tick, met);
    }
}

module.exports = CheckDistance;
