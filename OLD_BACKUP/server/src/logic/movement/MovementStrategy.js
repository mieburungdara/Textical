/**
 * Base Movement Strategy
 * Defines the contract for how a unit traverses the grid.
 */
class MovementStrategy {
    constructor(sim) {
        this.sim = sim;
    }

    /**
     * @param {BattleUnit} actor 
     * @param {BattleUnit|Object} target 
     * @returns {boolean} True if movement occurred
     */
    execute(actor, target) {
        throw new Error("MovementStrategy.execute() must be implemented.");
    }

    _teleport(actor, pos) {
        // AAA: Safety - Enforce 1-tile movement limit
        const dx = Math.abs(pos.x - actor.gridPos.x);
        const dy = Math.abs(pos.y - actor.gridPos.y);
        if (dx > 1 || dy > 1) {
            this.sim.logger.addEvent("ENGINE", `[MOVE_CAPPED] ${actor.data.name} attempt to jump ${Math.max(dx,dy)} tiles was rejected.`, {}, true);
            return { from: actor.gridPos, to: actor.gridPos };
        }

        // Core grid update logic (Atomic Move)
        const oldPos = { ...actor.gridPos };
        this.sim.notifyAdjacencyLost(actor);
        
        // Update occupancy grid
        this.sim.grid.unitGrid[oldPos.y][oldPos.x] = null;
        this.sim.grid.removeObstacle(oldPos.x, oldPos.y);
        
        actor.gridPos = { x: pos.x, y: pos.y };
        this.sim.grid.unitGrid[pos.y][pos.x] = actor;
        this.sim.grid.addObstacle(pos.x, pos.y);

        this.sim.notifyAdjacencyGained(actor);
        
        // Return event data for logging
        return { from: oldPos, to: actor.gridPos };
    }
}

module.exports = MovementStrategy;
