const _ = require('lodash');
const traitService = require('../services/traitService');
const btManager = require('./bt/BTManager');

class BattleAI {
    constructor(sim) {
        this.sim = sim;
    }

    decideAction(actor) {
        // --- 1. Pre-Action Hook ---
        if (traitService.executeHook("onPreAction", actor, this.sim) === false) return;

        // Trace
        this.sim.logger.addEvent("ENGINE", `[AI] ${actor.data.name} is making a decision.`, { unit_id: actor.instanceId });

        // Reset per-turn tactical state
        actor.temporaryStats.speed_mod = 0;

        // Check for behavior tree override
        const treeName = actor.data.bt_tree || null; 
        if (treeName) {
            btManager.execute(treeName, actor, this.sim);
            traitService.executeHook("onPostAction", actor, this.sim);
            return; 
        }

        // --- Standard Fallback (If BT fails or missing) ---
        const target = traitService.executeHook("onTargetAcquisition", actor, this.sim) || this.findTarget(actor);
        if (target) {
            const dist = this.sim.grid.getDistance(actor.gridPos, target.gridPos);
            const range = actor.stats.attack_range || 1;

            if (dist <= range) {
                this.sim.rules.performAttack(actor, target);
            } else {
                if (traitService.executeHook("onBeforeMove", actor, this.sim) !== false) {
                    this.moveTowards(actor, target);
                }
            }
        }
        
        traitService.executeHook("onPostAction", actor, this.sim);
    }

    findTarget(actor) {
        const units = this.sim.units || [];
        let targets = units.filter(u => u && u.teamId !== actor.teamId && !u.isDead);
        if (targets.length === 0) return null;
        return _.minBy(targets, (t) => this.sim.grid.getDistance(actor.gridPos, t.gridPos));
    }

    moveTowards(actor, target) {
        if (!target) return;
        
        const path = this.sim.grid.findPath(actor.gridPos, target.gridPos);
        
        if (!path || path.length <= 1) {
            this.sim.logger.addEvent("ENGINE", `[PATH_FAIL] ${actor.data.name} found no path to ${target.data.name} at [${target.gridPos.x}, ${target.gridPos.y}]`, {
                actor_id: actor.instanceId,
                from: actor.gridPos,
                to: target.gridPos
            });
            return;
        }

        const next = path[1];
        const oldPos = { ...actor.gridPos };

        this.sim.notifyAdjacencyLost(actor);
        traitService.executeHook("onTileExit", actor, oldPos, this.sim);
        
        this.sim.grid.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
        actor.gridPos = { x: next.x, y: next.y };
        this.sim.grid.unitGrid[next.y][next.x] = actor;

        traitService.executeHook("onTileEnter", actor, actor.gridPos, this.sim);
        traitService.executeHook("onMoveStep", actor, actor.gridPos, this.sim);
        this.sim.notifyAdjacencyGained(actor);

        this.sim.logger.addEvent("MOVE", `${actor.data.name} moved to [${next.x}, ${next.y}]`, {
            actor_id: actor.instanceId,
            from: oldPos,
            to: actor.gridPos
        });
        
        traitService.executeHook("onMoveEnd", actor, this.sim);
    }
}

module.exports = BattleAI;