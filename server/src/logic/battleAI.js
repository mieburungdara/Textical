const traitService = require('../services/traitService'); // UPDATED

class BattleAI {
    constructor(sim) {
        this.sim = sim;
    }

    decideAction(actor) {
        for (let skillId in actor.skillCooldowns) { if (actor.skillCooldowns[skillId] > 0) actor.skillCooldowns[skillId]--; }
        const target = traitService.executeHook("onTargetAcquisition", actor, this.sim) || this.findTarget(actor);
        if (!target) return;

        const dist = this.sim.grid.getDistance(actor.gridPos, target.gridPos);
        if (actor.behavior === "coward" && (actor.currentHealth / actor.stats.health_max) < 0.4) { this.executeFlee(actor, target); return; }

        const skill = this.getBestUsableSkill(actor, dist);
        if (skill) { this.sim.rules.performSkill(actor, skill, target.gridPos); return; }

        const range = actor.stats.attack_range || 1;
        if (dist <= range) { this.sim.rules.performAttack(actor, target); }
        else {
            if (traitService.executeHook("onBeforeMove", actor, this.sim) !== false) this.moveTowards(actor, target);
        }
    }

    findTarget(actor) {
        const enemies = this.sim.units.filter(u => !u.isDead && u.teamId !== actor.teamId);
        if (enemies.length === 0) return null;
        switch (actor.behavior) {
            case "assassin": return enemies.sort((a, b) => (a.currentHealth - b.currentHealth) || (actor.teamId === 0 ? b.gridPos.x - a.gridPos.x : a.gridPos.x - b.gridPos.x))[0];
            case "berserker": return enemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, a.gridPos) - this.sim.grid.getDistance(actor.gridPos, b.gridPos))[0];
            default: return enemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, a.gridPos) - this.sim.grid.getDistance(actor.gridPos, b.gridPos))[0];
        }
    }

    getBestUsableSkill(actor, dist) {
        if (!actor.data.skills) return null;
        return actor.data.skills.find(s => dist <= s.range && (actor.skillCooldowns[s.id] || 0) === 0 && actor.canAfford(s.mana_cost || 0));
    }

    moveTowards(actor, target) {
        this.sim.grid.findPath(actor.gridPos, target.gridPos, (path) => {
            if (path && path.length > 1) {
                const next = { x: path[1].x, y: path[1].y };
                if (!this.sim.grid.isTileOccupied(next.x, next.y)) {
                    this.sim.grid.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
                    actor.gridPos = next;
                    this.sim.grid.unitGrid[next.y][next.x] = actor;
                    traitService.executeHook("onMoveStep", actor, next, this.sim);
                }
            }
            traitService.executeHook("onMoveEnd", actor, this.sim);
        });
    }

    executeFlee(actor, enemy) {
        const fleeX = (actor.teamId === 0) ? 0 : this.sim.width - 1;
        this.sim.grid.findPath(actor.gridPos, { x: fleeX, y: actor.gridPos.y }, (path) => {
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
