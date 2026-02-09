const _ = require('lodash');
const traitService = require('../services/traitService');
const btManager = require('./bt/BTManager');
const AStarMovement = require('./movement/AStarMovement');
const skillExecutor = require('./rules/skillExecutor');

class BattleAI {
    constructor(sim) {
        this.sim = sim;
        // Default Strategy
        this.defaultMovement = new AStarMovement(sim);
    }

    decideAction(actor) {
        if (traitService.executeHook("onPreAction", actor, this.sim) === false) return false;
        
        // AAA: Forced Target Re-evaluation if stuck
        if (actor.stuckTicks >= 3) {
            this.sim.logger.addEvent("ENGINE", `[AI_RETARGET] ${actor.data.name} searching for new path.`, { unit_id: actor.instanceId }, true);
            // Clear current target to force re-finding
            const blackboard = btManager.blackboards[actor.instanceId];
            if (blackboard) blackboard.set('target', null);
        }

        if (!actor.temporaryStats) {
            actor.temporaryStats = {};
        }
        actor.temporaryStats.speed_mod = 0;

        const treeName = actor.data.bt_tree || null; 
        if (treeName) {
            const success = btManager.execute(treeName, actor, this.sim);
            traitService.executeHook("onPostAction", actor, this.sim);
            return success; 
        }

        // Fallback Logic
        const target = traitService.executeHook("onTargetAcquisition", actor, this.sim) || this.findTarget(actor);
        let actionTaken = false;

        if (target) {
            const dist = this.sim.grid.getDistance(actor.gridPos, target.gridPos);
            const range = actor.stats.attack_range || 1;

            // --- AAA SKILL LOGIC ---
            if (actor.activeSkills && actor.activeSkills.length > 0) {
                // Simple AI: 30% chance to use a skill if range is valid
                if (Math.random() < 0.3) {
                    const skill = actor.activeSkills[0];
                    const skillMeta = skill.metadata || {};
                    const skillRange = skillMeta.range || range;

                    if (dist <= skillRange) {
                        skillExecutor.execute(actor, target, skill, this.sim);
                        actionTaken = true;
                    }
                }
            }

            if (!actionTaken) {
                if (dist <= range) {
                    this.sim.rules.performAttack(actor, target);
                    actionTaken = true;
                } else {
                    if (traitService.executeHook("onBeforeMove", actor, this.sim) !== false) {
                        actionTaken = this.moveTowards(actor, target);
                    }
                }
            }
        }
        
        traitService.executeHook("onPostAction", actor, this.sim);
        return actionTaken;
    }

    findTarget(actor) {
        // ... (rest of findTarget remains same) ...
        const units = this.sim.units || [];
        const hasTrueSight = traitService.executeHook("CheckTrait", actor, this.sim, { traitName: "truesight" });

        let targets = units.filter(u => {
            if (!u || u.teamId === actor.teamId || u.isDead) return false;
            
            // AAA Logic: Stealth Check
            if (u.isStealthed && !hasTrueSight) {
                const dist = this.sim.grid.getDistance(actor.gridPos, u.gridPos);
                if (dist > 1) return false; // Reveal range is 1 tile
            }
            
            return true;
        });

        if (targets.length === 0) return null;

        // Check target priority
        if (actor.data.target_priority === 2) {
            // Prioritize lowest HP
            return _.minBy(targets, (t) => t.currentHealth);
        }

        // Default: Closest enemy
        return _.minBy(targets, (t) => this.sim.grid.getDistance(actor.gridPos, t.gridPos));
    }

    moveTowards(actor, target) {
        if (!target) return false;
        
        // AAA: Dynamic Strategy Composition
        // Allows a trait to swap movement logic (e.g. Charge, Teleport)
        const strategy = actor.movementStrategy || this.defaultMovement;
        
        const moved = strategy.execute(actor, target);
        
        if (moved) {
            traitService.executeHook("onMoveEnd", actor, this.sim);
        }
        return moved;
    }

    /**
     * getEngagedCount: Returns how many units from the same team are currently 
     * adjacent to the given target.
     */
    getEngagedCount(target, teamId) {
        if (!target || !target.gridPos) return 0;
        const neighbors = this.sim.grid.getNeighbors(target.gridPos);
        let count = 0;
        neighbors.forEach(pos => {
            const unit = this.sim.grid.unitGrid[pos.y][pos.x];
            if (unit && unit.teamId === teamId && !unit.isDead) {
                count++;
            }
        });
        return count;
    }
}

module.exports = BattleAI;
