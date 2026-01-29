const CombatRules = require('./combatRules');
const traitService = require('../services/traitService'); 

class BattleRules {
    constructor(sim) {
        this.sim = sim;
    }

    performAttack(attacker, defender) {
        if (traitService.executeHook("onPreAction", attacker, this.sim) === false) return;

        // --- AAA FEATURE 1: Directional Combat ---
        const relPos = this._getRelativePosition(attacker, defender); 
        
        let directionalDmgMult = 1.0;
        let directionalAccBonus = 0;
        let bypassBlock = false;

        if (relPos === "BACK") {
            directionalDmgMult = 1.5;
            directionalAccBonus = 50;
            bypassBlock = true;
        } else if (relPos === "SIDE") {
            directionalDmgMult = 1.1;
            bypassBlock = true;
        }

        // --- AAA FEATURE 2: Cover System ---
        const hasCover = this._checkCover(attacker, defender);
        let coverDefBonus = hasCover ? 15 : 0;

        // Auto-Face toward attacker after receiving hit (Unless Stunned)
        if (!defender.isReady || defender.isReady()) {
            const dirToAttacker = this._getDirection(defender.gridPos, attacker.gridPos);
            defender.facing = dirToAttacker;
        }

        const atkMods = traitService.executeHook("onPreAttack", attacker, defender, this.sim) || {};
        const defMods = traitService.executeHook("onPreDefend", defender, attacker, this.sim) || {};

        if (atkMods.cancelAction || defMods.cancelAction) return;

        const dodgeChance = (defender.stats.dodge_rate || 0) + (defMods.bonusDodge || 0);
        const accuracy = (attacker.getStat("accuracy") || 100) + (atkMods.bonusAcc || 0) + directionalAccBonus;
        const hitChance = Math.min(100, Math.max(5, accuracy - dodgeChance));

        if (Math.random() * 100 > hitChance) {
            traitService.executeHook("onDodge", defender, attacker, this.sim);
            traitService.executeHook("onAttackMissed", attacker, defender, this.sim);
            this.sim.logger.addEvent("MISS", `${defender.data.name} dodged!`, { target_id: defender.instanceId });
            return;
        }

        const isBlocked = !bypassBlock && Math.random() < (defender.getStat("block_chance") || 0);
        if (isBlocked) traitService.executeHook("onBlock", defender, attacker, this.sim);

        const aTerrain = this.sim.grid.terrainGrid[attacker.gridPos.y][attacker.gridPos.x];
        const dTerrain = this.sim.grid.terrainGrid[defender.gridPos.y][defender.gridPos.x];
        const finalDmgMult = (atkMods.dmgMult || 1.0) * directionalDmgMult * (isBlocked ? 0.5 : 1.0);
        
        let result = CombatRules.calculateDamage(attacker, defender, finalDmgMult, 0, aTerrain, dTerrain);
        if (result.isCrit) traitService.executeHook("onCrit", attacker, defender, result.damage, this.sim);

        const impactMods = traitService.executeHook("onTakeDamage", defender, attacker, result.damage, this.sim) || {};
        let finalDamage = impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage;
        finalDamage = Math.max(1, finalDamage - coverDefBonus);

        defender.takeDamage(finalDamage);
        this._broadcastAllyEvent("onAllyDamage", defender, finalDamage);
        this.sim.unitDeeds[attacker.instanceId] = (this.sim.unitDeeds[attacker.instanceId] || 0) + finalDamage;

        traitService.executeHook("onPostHit", defender, attacker, finalDamage, this.sim);
        traitService.executeHook("onPostAttack", attacker, defender, finalDamage, this.sim);

        this.sim.logger.addEvent("ATTACK", `${attacker.data.name} attacked ${defender.data.name} from the ${relPos}!`, {
            actor_id: attacker.instanceId, target_id: defender.instanceId, 
            damage: finalDamage, rel_pos: relPos, has_cover: hasCover
        });

        if (defender.currentHealth <= 0) {
            traitService.executeHook("onKill", attacker, defender, this.sim);
            this._broadcastAllyEvent("onAllyKill", attacker, defender);
        }
        traitService.executeHook("onPostAction", attacker, this.sim);
    }

    _getDirection(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "EAST" : "WEST";
        return dy > 0 ? "SOUTH" : "NORTH";
    }

    _getRelativePosition(attacker, defender) {
        const dirToAttacker = this._getDirection(defender.gridPos, attacker.gridPos);
        // Correct AAA Logic:
        // If attacker is in FRONT of where defender is looking -> FRONT
        // If attacker is BEHIND where defender is looking -> BACK
        if (dirToAttacker === defender.facing) return "FRONT";
        
        const opposites = { "NORTH": "SOUTH", "SOUTH": "NORTH", "EAST": "WEST", "WEST": "EAST" };
        if (dirToAttacker === opposites[defender.facing]) return "BACK";
        
        return "SIDE";
    }

    _checkCover(attacker, defender) {
        const neighbors = this.sim.grid.getNeighbors(defender.gridPos);
        return neighbors.some(n => {
            if (this.sim.grid.terrainGrid[n.y][n.x] === 6) { 
                const distToAtkWithWall = this.sim.grid.getDistance(n, attacker.gridPos);
                const distToAtkBase = this.sim.grid.getDistance(defender.gridPos, attacker.gridPos);
                return distToAtkWithWall < distToAtkBase;
            }
            return false;
        });
    }

    _broadcastAllyEvent(hookName, actor, ...args) {
        const units = this.sim.units || [];
        const allies = units.filter(u => u && u.teamId === actor.teamId && !u.isDead && u.instanceId !== actor.instanceId);
        allies.forEach(ally => traitService.executeHook(hookName, ally, actor, ...args));
    }

    _broadcastAdjacencyLost(unit) {
        const neighbors = this.sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(pos => {
            const neighbor = this.sim.grid.unitGrid[pos.y][pos.x];
            if (neighbor) {
                traitService.executeHook("onAdjacencyLost", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyLost", neighbor, unit, this.sim);
            }
        });
    }

    _broadcastAdjacencyGained(unit) {
        const neighbors = this.sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(pos => {
            const neighbor = this.sim.grid.unitGrid[pos.y][pos.x];
            if (neighbor && !neighbor.isDead) {
                traitService.executeHook("onAdjacencyGained", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyGained", neighbor, unit, this.sim);
            }
        });
    }

    performSkill(actor, skill, targetPos) {
        if (traitService.executeHook("onPreAction", actor, this.sim, skill) === false) return;
        actor.consumeMana(skill.mana_cost || 0, this.sim);
        actor.skillCooldowns[skill.id] = skill.cooldown || 3;
        
        const tiles = this.sim.grid.getTilesInPattern(targetPos, skill.aoe_pattern, skill.aoe_size);
        tiles.forEach(tile => {
            const victim = this.sim.grid.unitGrid[tile.y][tile.x];
            if (!victim || victim.isDead) return;

            const isBeneficial = (skill.type === "SUPPORT" || skill.type === "HEAL");
            const isTargetEnemy = victim.teamId !== actor.teamId;

            if ((isBeneficial && !isTargetEnemy) || (!isBeneficial && isTargetEnemy)) {
                const atkMods = traitService.executeHook("onPreAttack", actor, victim, this.sim, skill) || {};
                const defMods = traitService.executeHook("onPreDefend", victim, actor, this.sim, skill) || {};

                if (!isBeneficial) {
                    const dodgeChance = (victim.stats.dodge_rate || 0) + (defMods.bonusDodge || 0);
                    if (Math.random() * 100 < dodgeChance) {
                        traitService.executeHook("onDodge", victim, actor, this.sim, skill);
                        traitService.executeHook("onAttackMissed", actor, victim, this.sim, skill);
                        return;
                    }
                }

                const dmgMult = (skill.damage_multiplier || 1.0) * (atkMods.dmgMult || 1.0);
                const result = CombatRules.calculateDamage(actor, victim, dmgMult, skill.element || 0);
                if (result.isCrit) traitService.executeHook("onCrit", actor, victim, result.damage, this.sim, skill);

                const impactMods = traitService.executeHook("onTakeDamage", victim, actor, result.damage, this.sim, skill) || {};
                const finalVal = impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage;
                
                if (isBeneficial) {
                    victim.currentHealth = Math.min(victim.stats.health_max, victim.currentHealth + finalVal);
                    traitService.executeHook("onHealthRegen", victim, finalVal, this.sim);
                } else {
                    victim.takeDamage(finalVal);
                    this._broadcastAllyEvent("onAllyDamage", victim, finalVal);
                    traitService.executeHook("onPostHit", victim, actor, finalVal, this.sim, skill);
                }
                
                traitService.executeHook("onPostAttack", actor, victim, finalVal, this.sim, skill);
                if (skill.status_effect) victim.applyEffect({ ...skill.status_effect }, this.sim);

                if (victim.currentHealth <= 0) {
                    traitService.executeHook("onKill", actor, victim, this.sim, skill);
                    this._broadcastAllyEvent("onAllyKill", actor, victim);
                }
            }
        });
        traitService.executeHook("onPostAction", actor, this.sim, skill);
    }

    resolveDeaths() {
        const currentDead = this.sim.units.filter(u => !u.isDead && u.currentHealth <= 0);
        currentDead.forEach(u => {
            if (traitService.executeHook("onBeforeDeath", u, this.sim)) return;
            this._broadcastAdjacencyLost(u);
            u.isDead = true;
            u.modifyAP(-u.currentActionPoints, this.sim);
            this.sim.grid.unitGrid[u.gridPos.y][u.gridPos.x] = null;
            traitService.executeHook("onDeath", u, this.sim);
            this._broadcastAllyEvent("onAllyDeath", u);
            if (u.teamId === 1) this.sim.killedMonsterIds.push(u.data.id);
            this.sim.rewards.gold += 15;
            this.sim.rewards.exp += (u.data.exp_reward || 10);
            this.sim.logger.addEvent("DEATH", `${u.data.name} died`, { target_id: u.instanceId });
        });
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