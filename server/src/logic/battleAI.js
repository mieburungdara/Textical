const _ = require('lodash');
const traitService = require('../services/traitService');
const btManager = require('./bt/BTManager');
const AStarMovement = require('./movement/AStarMovement');

class BattleAI {
    constructor(sim) {
        this.sim = sim;
        // Default Strategy
        this.defaultMovement = new AStarMovement(sim);
    }

    decideAction(actor) {
        if (traitService.executeHook("onPreAction", actor, this.sim) === false) return;
        actor.temporaryStats.speed_mod = 0;

        const treeName = actor.data.bt_tree || null; 
        if (treeName) {
            btManager.execute(treeName, actor, this.sim);
            traitService.executeHook("onPostAction", actor, this.sim);
            return; 
        }

        // Fallback Logic
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
        
        // AAA: Dynamic Strategy Composition
        // Allows a trait to swap movement logic (e.g. Charge, Teleport)
        const strategy = actor.movementStrategy || this.defaultMovement;
        
        const moved = strategy.execute(actor, target);
        
        if (moved) {
            traitService.executeHook("onMoveEnd", actor, this.sim);
        }
    }
}

module.exports = BattleAI;
