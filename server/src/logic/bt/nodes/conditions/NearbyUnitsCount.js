const LogicGate = require('./LogicGate');

/**
 * NearbyUnitsCount: Counts units within a specific range.
 * Properties: 
 * - range: Radius to check
 * - team: 'SAME' or 'OTHER'
 * - minCount: Minimum units required to trigger SUCCESS
 */
class NearbyUnitsCount extends LogicGate {
    constructor(params) { super({ name: 'NearbyUnitsCount', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const range = this.properties.range || 3;
        const teamType = this.properties.team || 'OTHER';
        const minCount = this.properties.minCount || 2;
        
        const count = sim.units.filter(u => {
            if (u.instanceId === unit.instanceId || u.currentHealth <= 0) return false;
            
            const isSameTeam = u.teamId === unit.teamId;
            const matchesTeam = (teamType === 'SAME') ? isSameTeam : !isSameTeam;
            
            if (!matchesTeam) return false;
            
            const dist = sim.grid.getDistance(unit.gridPos, u.gridPos);
            return dist <= range;
        }).length;
        
        return this.executePath(tick, count >= minCount);
    }
}

module.exports = NearbyUnitsCount;
