const traitService = require('../services/traitService'); // UPDATED
const btManager = require('./bt/BTManager');

class BattleAI {
    constructor(sim) {
        this.sim = sim;
    }

    decideAction(actor) {
        // --- NEW: Behavior Tree Logic ---
        // If the unit has a specific BT assigned (e.g., 'BaseAI'), use it
        const treeName = actor.data.bt_tree || null; 
        if (treeName) {
            btManager.execute(treeName, actor, this.sim);
            return; // BT took control
        }

        // --- Fallback: Hardcoded Legacy Logic ---
        for (let skillId in actor.skillCooldowns) { if (actor.skillCooldowns[skillId] > 0) actor.skillCooldowns[skillId]--; }
        const target = traitService.executeHook("onTargetAcquisition", actor, this.sim) || this.findTarget(actor);
        if (!target) return;

        const dist = this.sim.grid.getDistance(actor.gridPos, target.gridPos);
        if (actor.behavior === "coward" && (actor.currentHealth / actor.stats.health_max) < 0.4) { this.executeFlee(actor, target); return; }

        // --- NEW: Check Silence ---
        const skill = actor.isSilenced() ? null : this.getBestUsableSkill(actor, dist);
        if (skill) { this.sim.rules.performSkill(actor, skill, target.gridPos); return; }

        const range = actor.stats.attack_range || 1;
        if (dist <= range) { 
            // Break Stealth when attacking
            if (actor.isStealth()) actor.removeEffect("STEALTH");
            this.sim.rules.performAttack(actor, target); 
        }
        else {
            if (traitService.executeHook("onBeforeMove", actor, this.sim) !== false) this.moveTowards(actor, target);
        }
    }

    findTarget(actor) {
        // --- Check Provoked (Taunt) ---
        const provokerId = actor.getProvokerId();
        if (provokerId) {
            const provoker = this.sim.units.find(u => u.instanceId === provokerId && !u.isDead);
            if (provoker) return provoker;
        }

        // --- Filter out Stealth units unless they are the only ones left ---
        const enemies = this.sim.units.filter(u => !u.isDead && u.teamId !== actor.teamId && !u.isStealth());
        
        // Fallback to stealth units if no visible enemies exist
        const targetableEnemies = enemies.length > 0 ? enemies : this.sim.units.filter(u => !u.isDead && u.teamId !== actor.teamId);
        
        if (targetableEnemies.length === 0) return null;
        
        switch (actor.behavior) {
            case "assassin": return targetableEnemies.sort((a, b) => (a.currentHealth - b.currentHealth) || (actor.teamId === 0 ? b.gridPos.x - a.gridPos.x : a.gridPos.x - b.gridPos.x))[0];
            case "berserker": return targetableEnemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, a.gridPos) - this.sim.grid.getDistance(actor.gridPos, b.gridPos))[0];
            default: return targetableEnemies.sort((a, b) => this.sim.grid.getDistance(actor.gridPos, a.gridPos) - this.sim.grid.getDistance(actor.gridPos, b.gridPos))[0];
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
