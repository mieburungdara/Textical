class BattleAI {
    /**
     * @param {Object} sim 
     */
    constructor(sim) {
        /** @type {Object} */
        this.sim = sim;
    }

    /**
     * @param {Object} actor 
     */
    decideAction(actor) {
        // Cooldowns
        for (let skillId in actor.skillCooldowns) { 
            if (actor.skillCooldowns[skillId] > 0) actor.skillCooldowns[skillId]--; 
        }

        const target = this.findTarget(actor);
        if (!target) return;

        const dist = this.sim.grid.getDistance(actor.gridPos, target.gridPos);
        const hpPercent = actor.currentHealth / actor.stats.health_max;

        // 1. Flee
        if (hpPercent < (actor.data.flee_threshold || 0)) {
            if (this.executeFlee(actor, target)) return;
        }

        // 2. Skill
        const usableSkill = this.getBestUsableSkill(actor, dist);
        if (usableSkill) {
            this.sim.rules.performSkill(actor, usableSkill, target.gridPos);
            return;
        }

        // 3. Attack or Move
        const attackRange = actor.stats.attack_range || 1;
        const preferredRange = actor.data.preferred_range || 1;

        if (dist <= attackRange) {
            if (dist < preferredRange) {
                if (!this.executeFlee(actor, target)) {
                    this.sim.rules.performAttack(actor, target);
                }
            } else {
                this.sim.rules.performAttack(actor, target);
            }
        } else {
            this.moveTowards(actor, target);
        }
    }

    /**
     * @param {Object} actor 
     */
    findTarget(actor) {
        const enemies = this.sim.units.filter(u => !u.isDead && u.teamId !== actor.teamId);
        if (enemies.length === 0) return null;
        
        const priority = actor.data.target_priority ?? 0;
        switch (priority) {
            case 1: // Furthest
                return enemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, b.gridPos) - this.sim.grid.getDistance(actor.gridPos, a.gridPos))[0];
            case 2: // Lowest HP
                return enemies.sort((a, b) => a.currentHealth - b.currentHealth)[0];
            case 3: // Highest HP
                return enemies.sort((a, b) => b.currentHealth - a.currentHealth)[0];
            default: // Closest
                return enemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, a.gridPos) - this.sim.grid.getDistance(actor.gridPos, b.gridPos))[0];
        }
    }

    /**
     * @param {Object} actor 
     * @param {number} dist 
     */
    getBestUsableSkill(actor, dist) {
        if (!actor.data.skills) return null;
        return actor.data.skills.find(s => 
            dist <= s.range && 
            (actor.skillCooldowns[s.id] || 0) === 0 && 
            actor.canAfford(s.mana_cost || 0)
        );
    }

    /**
     * @param {Object} actor 
     * @param {Object} target 
     */
    moveTowards(actor, target) {
        this.sim.grid.findPath(actor.gridPos, target.gridPos, (path) => {
            if (path && path.length > 1) {
                const next = { x: path[1].x, y: path[1].y };
                if (!this.sim.grid.isTileOccupied(next.x, next.y)) {
                    // Update Grid
                    this.sim.grid.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
                    actor.gridPos = next;
                    this.sim.grid.unitGrid[next.y][next.x] = actor;

                    // Apply Lava
                    if (this.sim.grid.terrainGrid[next.y][next.x] === 3) {
                        actor.takeDamage(5);
                        this.sim.logger.addEntry(this.sim.currentTick, "VFX", `${actor.data.name} burned!`, this.sim.units, { actor_id: actor.instanceId, vfx: "burn" });
                    }

                    this.sim.logger.addEntry(this.sim.currentTick, "MOVE", `${actor.data.name} moved`, this.sim.units, {
                        actor_id: actor.instanceId,
                        from: actor.gridPos,
                        to: next
                    });
                }
            }
        });
    }

    /**
     * @param {Object} actor 
     * @param {Object} enemy 
     */
    executeFlee(actor, enemy) {
        const neighbors = [
            {x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0},
            {x:1,y:1},{x:-1,y:-1},{x:1,y:-1},{x:-1,y:1}
        ];
        let bestTile = null;
        let maxDist = -1;

        neighbors.forEach(n => {
            const p = { x: actor.gridPos.x + n.x, y: actor.gridPos.y + n.y };
            if (p.x >= 0 && p.x < this.sim.width && p.y >= 0 && p.y < this.sim.height && !this.sim.grid.isTileOccupied(p.x, p.y)) {
                const d = this.sim.grid.getDistance(p, enemy.gridPos);
                if (d > maxDist) { maxDist = d; bestTile = p; }
            }
        });

        if (bestTile) {
            this.sim.grid.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
            actor.gridPos = bestTile;
            this.sim.grid.unitGrid[bestTile.y][bestTile.x] = actor;
            this.sim.logger.addEntry(this.sim.currentTick, "MOVE", `${actor.data.name} repositioned`, this.sim.units, { 
                actor_id: actor.instanceId, 
                to: bestTile 
            });
            return true;
        }
        return false;
    }
}

module.exports = BattleAI;
