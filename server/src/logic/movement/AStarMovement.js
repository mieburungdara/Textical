const MovementStrategy = require('./MovementStrategy');
const traitService = require('../../services/traitService');

class AStarMovement extends MovementStrategy {
    execute(actor, target) {
        // 1. Calculate Path
        const path = this.sim.grid.findPath(actor.gridPos, target.gridPos);
        
        if (!path || path.length <= 1) {
            this.sim.logger.addEvent("ENGINE", `[PATH_FAIL] ${actor.data.name} blocked.`, { unit_id: actor.instanceId });
            return false;
        }

        const next = path[1];
        
        // 2. Pre-Move Hooks
        const oldPos = { ...actor.gridPos };
        traitService.executeHook("onTileExit", actor, oldPos, this.sim);

        // 3. Execute Move
        const moveEvent = this._teleport(actor, { x: next.x, y: next.y });

        // 4. Post-Move Hooks
        traitService.executeHook("onTileEnter", actor, actor.gridPos, this.sim);
        traitService.executeHook("onMoveStep", actor, actor.gridPos, this.sim);
        
        this.sim.logger.addEvent("MOVE", `${actor.data.name} moved to [${next.x}, ${next.y}]`, {
            actor_id: actor.instanceId,
            from: moveEvent.from,
            to: moveEvent.to
        });

        return true;
    }
}

module.exports = AStarMovement;
