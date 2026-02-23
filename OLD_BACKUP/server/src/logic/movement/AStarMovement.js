const MovementStrategy = require('./MovementStrategy');
const traitService = require('../../services/traitService');

class AStarMovement extends MovementStrategy {
    execute(actor, target) {
        // 0. Global Move Cooldown - Final Loop Buster
        if (actor.moveCooldownTicks > 0) {
            actor.moveCooldownTicks--;
            return false;
        }

        // 1. Wait Duration Check (Anti-Stuck)
        if (actor.waitTicks > 0) {
            actor.waitTicks--;
            return false;
        }

        // 2. Distance Check - If adjacent, don't move.
        const currentDist = this.sim.grid.getDistance(actor.gridPos, target.gridPos);
        const attackRange = actor.stats.attack_range || 1;
        if (currentDist <= attackRange) return false; 

        // 3. Support for Slipstream trait
        const canSlipstream = actor.traits.includes("disruptor");
        if (canSlipstream) this.sim.grid.easystar.stopAvoidingAllAdditionalPoints();

        // AAA: Apply Local Obstacle Memory to Grid
        if (actor.localObstacles) {
            for (const [coord, expiry] of Object.entries(actor.localObstacles)) {
                if (this.sim.currentTick < expiry) {
                    const [ox, oy] = coord.split(',').map(Number);
                    this.sim.grid.addObstacle(ox, oy);
                } else {
                    delete actor.localObstacles[coord]; // Clean up expired
                }
            }
        }

        // 4. Find target tile
        let targetPos = target.gridPos;
        if (this.sim.grid.isTileOccupied(targetPos.x, targetPos.y)) {
            const neighbors = this.sim.grid.getNeighbors(targetPos);
            const free = neighbors.filter(n => !this.sim.grid.isTileOccupied(n.x, n.y));
            if (free.length > 0) targetPos = free[Math.floor(Math.random() * free.length)];
        }

        const path = this.sim.grid.findPath(actor.gridPos, targetPos);
        
        // AAA: Cleanup Local Obstacles from global grid after search
        this.sim.grid.updateObstacles(this.sim.units);

        if (!path || path.length <= 1) return false;

        const next = path[1];

        // 4. Collision & Cooldown Execution
        if (this.sim.grid.isTileOccupied(next.x, next.y)) {
            // AAA: Memory-Based Detour Logic
            if (!actor.localObstacles) actor.localObstacles = {};
            actor.localObstacles[`${next.x},${next.y}`] = this.sim.currentTick + 10;
            
            this.sim.logger.addEvent("ENGINE", `[AI_DETOUR] ${actor.data.name} marked ${next.x},${next.y} as blocked.`, { unit_id: actor.instanceId }, true);
            
            actor.waitTicks = 1; // Minimal wait
            return false;
        }

        const moveEvent = this._teleport(actor, next);
        // AAA: Removed static moveCooldownTicks = 5 to allow ultra-responsive tracking
        
        this.sim.logger.addEvent("MOVE", `${actor.data.name} moved.`, {
            actorId: actor.instanceId,
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
                    this.sim.logger.addEvent("REACTION", `${unit.data.name} takes an opportunity strike!`, {
                        actorId: unit.instanceId,
                        targetId: actor.instanceId
                    });
                    this.sim.rules.performAttack(unit, actor, true); 
                }
            }
        });
    }
}

module.exports = AStarMovement;
