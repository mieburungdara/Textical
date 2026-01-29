const b3 = require('behavior3js');

/**
 * KiteTarget: Moves away from the target while staying within sensing range.
 */
const KiteTarget = b3.Class(b3.Action);

KiteTarget.prototype.initialize = function(params = {}) {
    b3.Action.prototype.initialize.call(this, params);
    this.name = 'KiteTarget';
}

KiteTarget.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    // Simplified target retrieval
    const target = tick.blackboard.get('target') || sim.ai.findTarget(unit);
    
    if (!target) return b3.FAILURE;

    const currentDist = sim.grid.getDistance(unit.gridPos, target.gridPos);
    
    // 8-Way Neighbor search for escape
    const neighbors = [
        {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0},
        {x: 1, y: 1}, {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}
    ];

    let bestTile = null;
    let maxDist = currentDist;

    for (const offset of neighbors) {
        const checkPos = { x: unit.gridPos.x + offset.x, y: unit.gridPos.y + offset.y };
        
        // AAA: Critical grid bounds and walkable check
        if (checkPos.x >= 0 && checkPos.x < sim.width && checkPos.y >= 0 && checkPos.y < sim.height) {
            const isBlocked = sim.grid.unitGrid[checkPos.y][checkPos.x] !== null;
            if (!isBlocked) {
                const newDist = sim.grid.getDistance(checkPos, target.gridPos);
                if (newDist > maxDist) {
                    maxDist = newDist;
                    bestTile = checkPos;
                }
            }
        }
    }

    if (bestTile) {
        sim.ai.moveTowards(unit, bestTile);
        return b3.SUCCESS;
    }

    return b3.FAILURE;
}

module.exports = KiteTarget;
