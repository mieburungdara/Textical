const traitService = require('../../services/traitService');
const CombatEventBroadcaster = require('./CombatEventBroadcaster');

/**
 * MovementResolver
 * Handles unit movement logic during combat, such as knockback effects and adjacency updates.
 */
class MovementResolver {
    /**
     * Handle knockback effect on a target unit
     * @param {Object} sim - The battle simulation context
     * @param {Object} sensor - The tactical sensor for directions
     * @param {Object} attacker - The unit performing the attack
     * @param {Object} defender - The unit receiving the knockback
     */
    static handleKnockback(sim, sensor, attacker, defender) {
        if (Math.random() >= 0.15 || defender.isDead) return;
        
        const attackDir = sensor.getDirection(attacker.gridPos, defender.gridPos);
        const dx = (attackDir === "EAST") ? 1 : (attackDir === "WEST" ? -1 : 0);
        const dy = (attackDir === "SOUTH") ? 1 : (attackDir === "NORTH" ? -1 : 0);
        const nextX = defender.gridPos.x + dx;
        const nextY = defender.gridPos.y + dy;

        if (nextX >= 0 && nextX < sim.width && nextY >= 0 && nextY < sim.height && !sim.grid.isTileOccupied(nextX, nextY)) {
            CombatEventBroadcaster.broadcastAdjacencyLost(sim, defender);
            
            // Update occupancy and obstacles
            sim.grid.unitGrid[defender.gridPos.y][defender.gridPos.x] = null;
            sim.grid.removeObstacle(defender.gridPos.x, defender.gridPos.y);
            
            const oldPos = { ...defender.gridPos };
            defender.gridPos = { x: nextX, y: nextY };
            sim.grid.unitGrid[nextY][nextX] = defender;
            sim.grid.addObstacle(nextX, nextY);
            
            sim.logger.addEvent("KNOCKBACK", `${defender.data.name} was knocked back!`, {
                targetId: defender.instanceId,
                from: oldPos,
                to: { x: nextX, y: nextY }
            });
            
            CombatEventBroadcaster.broadcastAdjacencyGained(sim, defender);
        } else {
            const nextYSafe = Math.max(0, Math.min(sim.height - 1, nextY));
            const nextXSafe = Math.max(0, Math.min(sim.width - 1, nextX));
            const obstacle = sim.grid.unitGrid[nextYSafe]?.[nextXSafe] || "WALL";
            traitService.executeHook("onObstacleImpact", defender, obstacle, sim);
        }
    }
}

module.exports = MovementResolver;
