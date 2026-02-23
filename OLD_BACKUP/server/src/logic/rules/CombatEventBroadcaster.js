const traitService = require('../../services/traitService');

/**
 * CombatEventBroadcaster
 * Handles broadcasting combat-related events and hooks to surrounding units.
 */
class CombatEventBroadcaster {
    static broadcastAllyEvent(sim, hookName, actor, ...args) {
        const units = sim.units || [];
        const allies = units.filter(u => u && u.teamId === actor.teamId && !u.isDead && u.instanceId !== actor.instanceId);
        allies.forEach(ally => traitService.executeHook(hookName, ally, sim, actor, ...args));
    }

    /**
     * Broadcast an event to allies and return the first truthy result (interception).
     * @param {Object} sim - The battle simulation context
     * @param {string} hookName - The name of the trait hook to execute
     * @param {Object} actor - The unit taking damage/being targeted
     * @param {...any} args - Additional arguments for the hook
     * @returns {Object|null} The result from the first intercepting trait
     */
    static broadcastInterceptableEvent(sim, hookName, actor, ...args) {
        const units = sim.units || [];
        const allies = units.filter(u => u && u.teamId === actor.teamId && !u.isDead && u.instanceId !== actor.instanceId);
        
        for (const ally of allies) {
            const result = traitService.executeHook(hookName, ally, sim, actor, ...args);
            if (result && result.intercepted) {
                return result;
            }
        }
        return null;
    }

    /**
     * Broadcast event when a unit leaves its current position (adjacency lost)
     * @param {Object} sim - The battle simulation context
     * @param {Object} unit - The unit that moved
     */
    static broadcastAdjacencyLost(sim, unit) {
        const neighbors = sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(pos => {
            const neighbor = sim.grid.unitGrid[pos.y]?.[pos.x];
            if (neighbor) {
                traitService.executeHook("onAdjacencyLost", unit, neighbor, sim);
                traitService.executeHook("onAdjacencyLost", neighbor, unit, sim);
            }
        });
    }

    /**
     * Broadcast event when a unit enters a new position (adjacency gained)
     * @param {Object} sim - The battle simulation context
     * @param {Object} unit - The unit that moved
     */
    static broadcastAdjacencyGained(sim, unit) {
        const neighbors = sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(pos => {
            const neighbor = sim.grid.unitGrid[pos.y]?.[pos.x];
            if (neighbor && !neighbor.isDead) {
                traitService.executeHook("onAdjacencyGained", unit, neighbor, sim);
                traitService.executeHook("onAdjacencyGained", neighbor, unit, sim);
            }
        });
    }
}

module.exports = CombatEventBroadcaster;
