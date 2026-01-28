const LogicGate = require('./LogicGate');

/**
 * CheckAllyCount: Mengecek berapa banyak teman yang masih hidup di arena.
 * Properties:
 * - minCount: Angka minimal teman.
 * - comparison: '>', '<', '=='
 */
class CheckAllyCount extends LogicGate {
    constructor(params) { super({ name: 'CheckAllyCount', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const allies = sim.units.filter(u => u.teamId === unit.teamId && u.currentHealth > 0 && u.instanceId !== unit.instanceId);
        
        const threshold = this.properties.minCount || 1;
        const operator = this.properties.comparison || '>=';
        
        let met = false;
        switch(operator) {
            case '>': met = allies.length > threshold; break;
            case '<': met = allies.length < threshold; break;
            case '==': met = allies.length === threshold; break;
            case '>=': met = allies.length >= threshold; break;
        }
        
        return this.executePath(tick, met);
    }
}

module.exports = CheckAllyCount;
