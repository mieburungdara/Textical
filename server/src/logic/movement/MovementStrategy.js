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
        // Core grid update logic (Atomic Move)
        const oldPos = { ...actor.gridPos };
        this.sim.notifyAdjacencyLost(actor);
        
        this.sim.grid.unitGrid[oldPos.y][oldPos.x] = null;
        actor.gridPos = { x: pos.x, y: pos.y };
        this.sim.grid.unitGrid[pos.y][pos.x] = actor;

        this.sim.notifyAdjacencyGained(actor);
        
        // Return event data for logging
        return { from: oldPos, to: actor.gridPos };
    }
}

module.exports = MovementStrategy;
