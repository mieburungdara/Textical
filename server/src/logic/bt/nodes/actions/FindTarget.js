const b3 = require('behavior3js');

/**
 * FindTarget: Scans the grid for a suitable target based on team and health.
 */
const FindTarget = b3.Class(b3.Action);

FindTarget.prototype.initialize = function(params = {}) {
    b3.Action.prototype.initialize.call(this, params);
    this.name = 'FindTarget';
    this.properties = params.properties || { strategy: 'ENEMIES' };
}

FindTarget.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const strategy = this.properties.strategy || 'ENEMIES';
    
    let targets = [];
    if (strategy === 'ENEMIES') {
        targets = (sim.units || []).filter(u => u && u.teamId !== unit.teamId && u.currentHealth > 0);
    } else if (strategy === 'ALLIES') {
        targets = (sim.units || []).filter(u => u && u.teamId === unit.teamId && u.currentHealth > 0);
    }
    
    if (targets.length === 0) {
        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} failed to find ${strategy}`);
        return b3.FAILURE;
    }
    
    const closest = targets.sort((a, b) => {
        const distA = sim.grid.getDistance(unit.gridPos, a.gridPos);
        const distB = sim.grid.getDistance(unit.gridPos, b.gridPos);
        return distA - distB;
    })[0];
    
    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} targeted ${closest.data.name} at [${closest.gridPos.x}, ${closest.gridPos.y}]`);
    
    // AAA: Use a consistent key without tree-scoping for easier access by other nodes
    tick.blackboard.set('target', closest); 
    
    return b3.SUCCESS;
}

module.exports = FindTarget;