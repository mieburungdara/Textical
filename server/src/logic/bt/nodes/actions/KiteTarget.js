const b3 = require('behavior3js');

/**
 * KiteTarget: Moves away from the target while staying within attack range.
 * Useful for Archers and Mages.
 */
class KiteTarget extends b3.Action {
    constructor(params) { 
        super({ name: 'KiteTarget', properties: params.properties || {} }); 
        this.properties = params.properties || {};
    }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
        
        if (!target) return b3.FAILURE;

        const dist = sim.grid.getDistance(unit.gridPos, target.gridPos);
        const preferredRange = unit.stats.attack_range || 1;

        // If already at a good distance, no need to kite
        if (dist >= preferredRange) return b3.SUCCESS;

        // Find surrounding tiles and pick the one that increases distance to target
        const neighbors = [
            {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0},
            {x: 1, y: 1}, {x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}
        ];

        let bestTile = null;
        let maxDist = dist;

        for (const offset of neighbors) {
            const checkPos = { x: unit.gridPos.x + offset.x, y: unit.gridPos.y + offset.y };
            
            if (sim.grid.isWalkable(checkPos.x, checkPos.y)) {
                const newDist = sim.grid.getDistance(checkPos, target.gridPos);
                // We want to move away, but not exceed attack range if possible
                if (newDist > maxDist && newDist <= preferredRange + 1) {
                    maxDist = newDist;
                    bestTile = checkPos;
                }
            }
        }

        if (bestTile) {
            sim.ai.moveTowards(unit, bestTile);
            return b3.SUCCESS;
        }

        return b3.FAILURE;
    }
}

module.exports = KiteTarget;
