/**
 * TacticalSensor
 * Handles directional math, flanking detection, and cover analysis.
 */
class TacticalSensor {
    constructor(sim) {
        this.sim = sim;
    }

    getDirection(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "EAST" : "WEST";
        return dy > 0 ? "SOUTH" : "NORTH";
    }

    getOppositeDirection(dir) {
        const map = { "NORTH": "SOUTH", "SOUTH": "NORTH", "EAST": "WEST", "WEST": "EAST" };
        return map[dir];
    }

    getRelativePosition(attacker, defender) {
        const dirToAttacker = this.getDirection(defender.gridPos, attacker.gridPos);
        if (dirToAttacker === defender.facing) return "FRONT";
        if (dirToAttacker === this.getOppositeDirection(defender.facing)) return "BACK";
        return "SIDE";
    }

    checkCover(attacker, defender) {
        const neighbors = this.sim.grid.getNeighbors(defender.gridPos);
        return neighbors.some(n => {
            if (this.sim.grid.terrainGrid[n.y][n.x] === 6) { // WALL ID
                return this.sim.grid.getDistance(n, attacker.gridPos) < this.sim.grid.getDistance(defender.gridPos, attacker.gridPos);
            }
            return false;
        });
    }
}

module.exports = TacticalSensor;
