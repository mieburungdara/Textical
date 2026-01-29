const CombatRules = require('./combatRules');
const traitService = require('../services/traitService'); 
const TacticalSensor = require('./rules/TacticalSensor');
const SkillResolver = require('./rules/SkillResolver');
const DeathResolver = require('./rules/DeathResolver');

/**
 * BattleRules (v4.0 - Component-Based Orchestrator)
 * Delegates combat phases to specialized sub-systems.
 */
class BattleRules {
    constructor(sim) {
        this.sim = sim;
        // Composition Pattern
        this.sensor = new TacticalSensor(sim);
        this.skills = new SkillResolver(sim);
        this.death = new DeathResolver(sim);
    }

    performAttack(attacker, defender) {
        if (traitService.executeHook("onPreAction", attacker, this.sim) === false) return;
        attacker.reveal(this.sim);

        // 1. Tactical Sensing (Directional & Cover)
        const relPos = this.sensor.getRelativePosition(attacker, defender); 
        const hasCover = this.sensor.checkCover(attacker, defender);
        
        let directionalDmgMult = (relPos === "BACK") ? 1.5 : (relPos === "SIDE" ? 1.1 : 1.0);
        let directionalAccBonus = (relPos === "BACK") ? 50 : 0;
        let bypassBlock = (relPos !== "FRONT");
        let coverDefBonus = hasCover ? 15 : 0;

        // Auto-face toward attacker
        if (!defender.isReady || defender.isReady()) {
            defender.facing = this.sensor.getDirection(defender.gridPos, attacker.gridPos);
        }

        // 2. Micro-Phases
        const atkMods = traitService.executeHook("onPreAttack", attacker, defender, this.sim) || {};
        const defMods = traitService.executeHook("onPreDefend", defender, attacker, this.sim) || {};

        if (atkMods.cancelAction || defMods.cancelAction) return;

        // 3. Accuracy & Dodge
        const dodgeChance = (defender.stats.dodge_rate || 0) + (defMods.bonusDodge || 0);
        const accuracy = (attacker.getStat("accuracy") || 100) + (atkMods.bonusAcc || 0) + directionalAccBonus;
        if (Math.random() * 100 > (accuracy - dodgeChance)) {
            traitService.executeHook("onDodge", defender, attacker, this.sim);
            this.sim.logger.addEvent("MISS", `${defender.data.name} dodged!`, { target_id: defender.instanceId });
            return;
        }

        // 4. Block Logic
        const isBlocked = !bypassBlock && Math.random() < (defender.getStat("block_chance") || 0);
        if (isBlocked) traitService.executeHook("onBlock", defender, attacker, this.sim);

        // 5. Damage Calculation
        const aTerrain = this.sim.grid.terrainGrid[attacker.gridPos.y][attacker.gridPos.x];
        const dTerrain = this.sim.grid.terrainGrid[defender.gridPos.y][defender.gridPos.x];
        const finalDmgMult = (atkMods.dmgMult || 1.0) * directionalDmgMult * (isBlocked ? 0.5 : 1.0);
        
        let result = CombatRules.calculateDamage(attacker, defender, finalDmgMult, 0, aTerrain, dTerrain);
        if (result.isCrit) traitService.executeHook("onCrit", attacker, defender, result.damage, this.sim);

        // 6. Mitigation & Hit Hooks
        const impactMods = traitService.executeHook("onTakeDamage", defender, attacker, result.damage, this.sim) || {};
        const finalDamage = Math.max(1, (impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage) - coverDefBonus);

        defender.takeDamage(finalDamage);
        this._broadcastAllyEvent("onAllyDamage", defender, finalDamage);
        this.sim.unitDeeds[attacker.instanceId] = (this.sim.unitDeeds[attacker.instanceId] || 0) + finalDamage;

        traitService.executeHook("onPostHit", defender, attacker, finalDamage, this.sim);
        traitService.executeHook("onPostAttack", attacker, defender, finalDamage, this.sim);
        traitService.executeHook("onLifesteal", attacker, finalDamage, this.sim);

        // 7. Knockback / Impact
        this._handleKnockback(attacker, defender);

        this.sim.logger.addEvent("ATTACK", `${attacker.data.name} hit ${defender.data.name}`, {
            actor_id: attacker.instanceId, target_id: defender.instanceId, damage: finalDamage, rel_pos: relPos
        });

        if (defender.currentHealth <= 0) {
            traitService.executeHook("onKill", attacker, defender, this.sim);
            this._broadcastAllyEvent("onAllyKill", attacker, defender);
        }
        traitService.executeHook("onPostAction", attacker, this.sim);
    }

    _handleKnockback(attacker, defender) {
        if (Math.random() >= 0.15 || defender.isDead) return;
        
        const attackDir = this.sensor.getDirection(attacker.gridPos, defender.gridPos);
        const dx = (attackDir === "EAST") ? 1 : (attackDir === "WEST" ? -1 : 0);
        const dy = (attackDir === "SOUTH") ? 1 : (attackDir === "NORTH" ? -1 : 0);
        const nextX = defender.gridPos.x + dx;
        const nextY = defender.gridPos.y + dy;

        if (nextX >= 0 && nextX < this.sim.width && nextY >= 0 && nextY < this.sim.height && !this.sim.grid.isTileOccupied(nextX, nextY)) {
            this._broadcastAdjacencyLost(defender);
            this.sim.grid.unitGrid[defender.gridPos.y][defender.gridPos.x] = null;
            defender.gridPos = { x: nextX, y: nextY };
            this.sim.grid.unitGrid[nextY][nextX] = defender;
            this._broadcastAdjacencyGained(defender);
        } else {
            const obstacle = this.sim.grid.unitGrid[nextY]?.[nextX] || "WALL";
            traitService.executeHook("onObstacleImpact", defender, obstacle, this.sim);
        }
    }

    _broadcastAllyEvent(hookName, actor, ...args) {
        const units = this.sim.units || [];
        const allies = units.filter(u => u && u.teamId === actor.teamId && !u.isDead && u.instanceId !== actor.instanceId);
        allies.forEach(ally => traitService.executeHook(hookName, ally, this.sim, actor, ...args));
    }

    _broadcastAdjacencyLost(unit) {
        const neighbors = this.sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(pos => {
            const neighbor = this.sim.grid.unitGrid[pos.y]?.[pos.x];
            if (neighbor) {
                traitService.executeHook("onAdjacencyLost", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyLost", neighbor, unit, this.sim);
            }
        });
    }

    _broadcastAdjacencyGained(unit) {
        const neighbors = this.sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(pos => {
            const neighbor = this.sim.grid.unitGrid[pos.y]?.[pos.x];
            if (neighbor && !neighbor.isDead) {
                traitService.executeHook("onAdjacencyGained", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyGained", neighbor, unit, this.sim);
            }
        });
    }

    performSkill(actor, skill, targetPos) {
        this.skills.resolve(actor, skill, targetPos);
    }

    resolveDeaths() {
        this.death.resolve();
    }

    checkWinCondition() {
        const aliveTeams = new Set(this.sim.units.filter(u => !u.isDead).map(u => u.teamId));
        if (aliveTeams.size <= 1) {
            this.sim.isFinished = true;
            this.sim.winnerTeam = Array.from(aliveTeams)[0] ?? -1;
            this.sim.units.forEach(u => traitService.executeHook("onBattleEnd", u, this.sim));
            return true;
        }
        return false;
    }
}

module.exports = BattleRules;