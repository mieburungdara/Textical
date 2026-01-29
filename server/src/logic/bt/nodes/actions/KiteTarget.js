const b3 = require('behavior3js');
const BaseMove = require('./BaseMove');

const KiteTarget = b3.Class(BaseMove);

KiteTarget.prototype.initialize = function(params = {}) {
    BaseMove.prototype.initialize.call(this, {
        name: 'KiteTarget',
        title: params.title || 'Strategic Kite',
        properties: params.properties || { safetyDist: 3 }
    });
}

KiteTarget.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
    
    if (!target) return b3.FAILURE;

    const dist = sim.grid.getDistance(unit.gridPos, target.gridPos);
    const safetyDist = this.properties.safetyDist || 3;

    // If unit is safe enough, succeed without moving
    if (dist >= safetyDist) return b3.SUCCESS;

    // Tactical escape direction logic
    const neighbors = sim.grid.getNeighbors(unit.gridPos);
    let bestTile = null;
    let maxDist = dist;

    neighbors.forEach(pos => {
        if (!sim.grid.isTileOccupied(pos.x, pos.y)) {
            const newDist = sim.grid.getDistance(pos, target.gridPos);
            if (newDist > maxDist) {
                maxDist = newDist;
                bestTile = pos;
            }
        }
    });

    if (bestTile) {
        return this.stepTowards(unit, bestTile, sim);
    }

    return b3.FAILURE;
}

module.exports = KiteTarget;