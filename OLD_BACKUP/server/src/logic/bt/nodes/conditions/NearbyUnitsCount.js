const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * NearbyUnitsCount: Counts units within range.
 */
const NearbyUnitsCount = b3.Class(LogicGate);

NearbyUnitsCount.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'NearbyUnitsCount';
}

NearbyUnitsCount.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const range = this.properties.range || 3;
    const teamType = this.properties.team || 'OTHER';
    const minCount = this.properties.minCount || 2;
    
    const units = sim.units || [];
    const count = units.filter(u => {
        if (!u || u.isDead || u.instanceId === unit.instanceId) return false;
        const isSameTeam = u.teamId === unit.teamId;
        const matchesTeam = (teamType === 'SAME') ? isSameTeam : !isSameTeam;
        if (!matchesTeam) return false;
        const dist = sim.grid.getDistance(unit.gridPos, u.gridPos);
        return dist <= range;
    }).length;
    
    const met = count >= minCount;
    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} sensed ${count} ${teamType} units within ${range}. (Req: ${minCount}). Result: ${met}`);
    
    return this.executePath(tick, met);
}

module.exports = NearbyUnitsCount;
