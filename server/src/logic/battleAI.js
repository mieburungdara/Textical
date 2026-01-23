const TraitsManager = require('./traitsManager');

class BattleAI {
    constructor(sim) {
        this.sim = sim;
    }

    decideAction(actor) {
        for (let skillId in actor.skillCooldowns) { 
            if (actor.skillCooldowns[skillId] > 0) actor.skillCooldowns[skillId]--; 
        }

        // 4. HOOK: Target Acquisition (Taunt/Stealth)
        const targetOverride = TraitsManager.executeHook("onTargetAcquisition", actor, this.sim);
        const target = targetOverride || this.findTarget(actor);
        
        if (!target) return;

        const dist = this.sim.grid.getDistance(actor.gridPos, target.gridPos);
        const usableSkill = this.getBestUsableSkill(actor, dist);

        if (usableSkill) {
            this.sim.rules.performSkill(actor, usableSkill, target.gridPos);
            return;
        }

        const attackRange = actor.stats.attack_range || 1;
        if (dist <= attackRange) {
            this.sim.rules.performAttack(actor, target);
        } else {
            // 5. HOOK: Before Move
            const canMove = TraitsManager.executeHook("onBeforeMove", actor, this.sim);
            if (canMove !== false) {
                this.moveTowards(actor, target);
            }
        }
    }

    findTarget(actor) {
        const enemies = this.sim.units.filter(u => !u.isDead && u.teamId !== actor.teamId);
        if (enemies.length === 0) return null;
        
        const priority = actor.data.target_priority ?? 0;
        switch (priority) {
            case 1: return enemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, b.gridPos) - this.sim.grid.getDistance(actor.gridPos, a.gridPos))[0];
            case 2: return enemies.sort((a, b) => a.currentHealth - b.currentHealth)[0];
            case 3: return enemies.sort((a, b) => b.currentHealth - a.currentHealth)[0];
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

                    // 6. HOOK: Move Step (Traps/Trails)
                    TraitsManager.executeHook("onMoveStep", actor, next, this.sim);

                    // TERRAIN DAMAGE: Lava check
                    if (this.sim.grid.terrainGrid[next.y][next.x] === 3) {
                        actor.takeDamage(10);
                        this.sim.logger.addEntry(this.sim.currentTick, "VFX", `${actor.data.name} burned!`, this.sim.units, { actor_id: actor.instanceId, vfx: "burn" });
                        
                        const actorDeeds = this.sim.unitDeeds[actor.instanceId] || {};
                        actorDeeds["steps_lava"] = (actorDeeds["steps_lava"] || 0) + 1;
                        this.sim.unitDeeds[actor.instanceId] = actorDeeds;
                    }

                    this.sim.logger.addEntry(this.sim.currentTick, "MOVE", `${actor.data.name} moved`, this.sim.units, { actor_id: actor.instanceId, from: actor.gridPos, to: next });
                }
            }
            // 7. HOOK: Move End
            TraitsManager.executeHook("onMoveEnd", actor, this.sim);
        });
    }
}

module.exports = BattleAI;
