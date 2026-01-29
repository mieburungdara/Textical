const MovementStrategy = require('./MovementStrategy');
const traitService = require('../../services/traitService');

class AStarMovement extends MovementStrategy {
    execute(actor, target) {
        const path = this.sim.grid.findPath(actor.gridPos, target.gridPos);
        
        if (!path || path.length <= 1) {
            this.sim.logger.addEvent("ENGINE", `[PATH_FAIL] ${actor.data.name} blocked.`, { unit_id: actor.instanceId });
            return false;
        }

        const next = path[1];
        const oldPos = { ...actor.gridPos };
        traitService.executeHook("onTileExit", actor, oldPos, this.sim);

        const moveEvent = this._teleport(actor, { x: next.x, y: next.y });

        traitService.executeHook("onTileEnter", actor, actor.gridPos, this.sim);
        traitService.executeHook("onMoveStep", actor, actor.gridPos, this.sim);
        
        // --- AAA FEATURE 3: Attack of Opportunity ---
        this._triggerOpportunityAttacks(actor);

        this.sim.logger.addEvent("MOVE", `${actor.data.name} moved to [${next.x}, ${next.y}]`, {
            actor_id: actor.instanceId,
            from: moveEvent.from,
            to: moveEvent.to
        });

        return true;
    }

    _triggerOpportunityAttacks(actor) {
        const neighbors = this.sim.grid.getNeighbors(actor.gridPos);
        neighbors.forEach(pos => {
            const unit = this.sim.grid.unitGrid[pos.y][pos.x];
            if (unit && unit.teamId !== actor.teamId && !unit.isDead) {
                // Ensure only melee units perform AoO
                if ((unit.stats.attack_range || 1) <= 1) {
                    this.sim.logger.addEvent("REACTION", `${unit.data.name} takes an opportunity strike!`);
                    this.sim.rules.performAttack(unit, actor); 
                }
            }
        });
    }
}

module.exports = AStarMovement;