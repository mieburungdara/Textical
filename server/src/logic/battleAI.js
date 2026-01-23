const TraitsManager = require('./traitsManager');

class BattleAI {
    constructor(sim) {
        this.sim = sim;
    }

    decideAction(actor) {
        for (let skillId in actor.skillCooldowns) { 
            if (actor.skillCooldowns[skillId] > 0) actor.skillCooldowns[skillId]--; 
        }

        const targetOverride = TraitsManager.executeHook("onTargetAcquisition", actor, this.sim);
        const target = targetOverride || this.findTarget(actor);
        
        if (!target) return;

        const dist = this.sim.grid.getDistance(actor.gridPos, target.gridPos);

        // BEHAVIOR CHECK: Cowardly flee
        if (actor.behavior === "coward" && (actor.currentHealth / actor.stats.health_max) < 0.4) {
            this.executeFlee(actor, target);
            return;
        }

        const usableSkill = this.getBestUsableSkill(actor, dist);
        if (usableSkill) {
            this.sim.rules.performSkill(actor, usableSkill, target.gridPos);
            return;
        }

        const attackRange = actor.stats.attack_range || 1;
        if (dist <= attackRange) {
            this.sim.rules.performAttack(actor, target);
        } else {
            const canMove = TraitsManager.executeHook("onBeforeMove", actor, this.sim);
            if (canMove !== false) {
                this.moveTowards(actor, target);
            }
        }
    }

    findTarget(actor) {
        const enemies = this.sim.units.filter(u => !u.isDead && u.teamId !== actor.teamId);
        if (enemies.length === 0) return null;
        
        // AAA BEHAVIOR: Target Selection
        switch (actor.behavior) {
            case "assassin":
                // Prioritize lowest HP backline targets (highest X for team 1, lowest X for team 0)
                return enemies.sort((a, b) => {
                    const hpDiff = a.currentHealth - b.currentHealth;
                    if (hpDiff !== 0) return hpDiff;
                    return (actor.teamId === 0) ? (b.gridPos.x - a.gridPos.x) : (a.gridPos.x - b.gridPos.x);
                })[0];

            case "berserker":
                // Always closest
                return enemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, a.gridPos) - this.sim.grid.getDistance(actor.gridPos, b.gridPos))[0];

            default: // Balanced
                return enemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, a.gridPos) - this.sim.grid.getDistance(actor.gridPos, b.gridPos))[0];
        }
    }

    moveTowards(actor, target) {
        this.sim.grid.findPath(actor.gridPos, target.gridPos, (path) => {
            if (path && path.length > 1) {
                const next = { x: path[1].x, y: path[1].y };
                if (!this.sim.grid.isTileOccupied(next.x, next.y)) {
                    this.sim.grid.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
                    actor.gridPos = next;
                    this.sim.grid.unitGrid[next.y][next.x] = actor;
                    TraitsManager.executeHook("onMoveStep", actor, next, this.sim);
                }
            }
            TraitsManager.executeHook("onMoveEnd", actor, this.sim);
        });
    }

    executeFlee(actor, enemy) {
        const fleeTargetX = (actor.teamId === 0) ? 0 : this.sim.width - 1;
        const targetPos = { x: fleeTargetX, y: actor.gridPos.y };
        
        this.sim.grid.findPath(actor.gridPos, targetPos, (path) => {
            if (path && path.length > 1) {
                const next = { x: path[1].x, y: path[1].y };
                this.sim.grid.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
                actor.gridPos = next;
                this.sim.grid.unitGrid[next.y][next.x] = actor;
            }
        });
    }
}

module.exports = BattleAI;