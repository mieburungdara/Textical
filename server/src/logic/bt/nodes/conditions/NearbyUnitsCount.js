const LogicGate = require('./LogicGate');

class NearbyUnitsCount extends LogicGate {
    constructor(params) { super({ name: 'NearbyUnitsCount', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const range = this.properties.range || 3;
        const teamType = this.properties.team || 'OTHER';
        const minCount = this.properties.minCount || 2;
        
        const units = sim.units || [];
        const count = units.filter(u => {
            if (!u || u.instanceId === unit.instanceId || u.currentHealth <= 0) return false;
            const isSameTeam = u.teamId === unit.teamId;
            const matchesTeam = (teamType === 'SAME') ? isSameTeam : !isSameTeam;
            if (!matchesTeam) return false;
            const dist = sim.grid.getDistance(unit.gridPos, u.gridPos);
            return dist <= range;
        }).length;
        
        const met = count >= minCount;
        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} counting ${teamType} units within ${range}: ${count} (Req: ${minCount}). Result: ${met}`);
        
        return this.executePath(tick, met);
    }
}

module.exports = NearbyUnitsCount;