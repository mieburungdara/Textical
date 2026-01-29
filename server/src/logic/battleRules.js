const CombatRules = require('./combatRules');
const traitService = require('../services/traitService'); 

class BattleRules {
    constructor(sim) {
        this.sim = sim;
    }

    performAttack(attacker, defender) {
        // 1. Pre-Action Lifecycle
        if (traitService.executeHook("onPreAction", attacker, this.sim) === false) return;

        // 2. Pre-Combat Micro-Phases (AAA)
        const atkMods = traitService.executeHook("onPreAttack", attacker, defender, this.sim) || {};
        const defMods = traitService.executeHook("onPreDefend", defender, attacker, this.sim) || {};

        if (atkMods.cancelAction || defMods.cancelAction) return;

        // 3. Dodge & Block Roll
        const dodgeChance = (defender.stats.dodge_rate || 0) + (defMods.bonusDodge || 0);
        if (Math.random() * 100 < dodgeChance) {
            traitService.executeHook("onDodge", defender, attacker, this.sim);
            traitService.executeHook("onAttackMissed", attacker, defender, this.sim);
            this.sim.logger.addEvent("MISS", `${defender.data.name} dodged!`, { target_id: defender.instanceId });
            return;
        }

        const isBlocked = Math.random() < (defMods.blockChance || 0);
        if (isBlocked) {
            traitService.executeHook("onBlock", defender, attacker, this.sim);
        }

        // 4. Hit Calculation
        const aTerrain = this.sim.grid.terrainGrid[attacker.gridPos.y][attacker.gridPos.x];
        const dTerrain = this.sim.grid.terrainGrid[defender.gridPos.y][defender.gridPos.x];
        const dmgMult = (atkMods.dmgMult || 1.0) * (attacker.tempDamageMult || 1.0) * (isBlocked ? 0.5 : 1.0);
        
        let result = CombatRules.calculateDamage(attacker, defender, dmgMult, 0, aTerrain, dTerrain);
        
        // 5. Critical Strike Hook
        if (result.isCrit) {
            traitService.executeHook("onCrit", attacker, defender, result.damage, this.sim);
        }

        // 6. Final Mitigation
        const impactMods = traitService.executeHook("onTakeDamage", defender, attacker, result.damage, this.sim) || {};
        const finalDamage = impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage;

        // 7. Apply Physical Change
        defender.takeDamage(finalDamage);
        this._broadcastAllyEvent("onAllyDamage", defender, finalDamage);
        this.sim.unitDeeds[attacker.instanceId] = (this.sim.unitDeeds[attacker.instanceId] || 0) + finalDamage;

        // 8. Post-Impact Life Cycle
        traitService.executeHook("onPostHit", defender, attacker, finalDamage, this.sim);
        traitService.executeHook("onPostAttack", attacker, defender, finalDamage, this.sim);
        traitService.executeHook("onLifesteal", attacker, finalDamage, this.sim);

        // --- AAA Hook: Knockback with full Sensing ---
        let knockbackData = null;
        if (Math.random() < 0.15 && !defender.isDead) {
            const dx = Math.sign(defender.gridPos.x - attacker.gridPos.x);
            const dy = Math.sign(defender.gridPos.y - attacker.gridPos.y);
            const nextX = defender.gridPos.x + dx;
            const nextY = defender.gridPos.y + dy;

            if (nextX >= 0 && nextX < this.sim.width && nextY >= 0 && nextY < this.sim.height && !this.sim.grid.isTileOccupied(nextX, nextY)) {
                const oldPos = { ...defender.gridPos };
                
                this._broadcastAdjacencyLost(defender);
                traitService.executeHook("onTileExit", defender, oldPos, this.sim);

                this.sim.grid.unitGrid[oldPos.y][oldPos.x] = null;
                defender.gridPos = { x: nextX, y: nextY };
                this.sim.grid.unitGrid[nextY][nextX] = defender;

                traitService.executeHook("onTileEnter", defender, defender.gridPos, this.sim);
                traitService.executeHook("onMoveStep", defender, defender.gridPos, this.sim);
                this._broadcastAdjacencyGained(defender);

                knockbackData = { from: oldPos, to: { x: nextX, y: nextY } };
            }
        }

        this.sim.logger.addEvent("ATTACK", `${attacker.data.name} hit ${defender.data.name}`, {
            actor_id: attacker.instanceId, target_id: defender.instanceId, 
            damage: finalDamage, is_crit: result.isCrit, knockback: knockbackData
        });

        // 9. Kill Life Cycle
        if (defender.currentHealth <= 0) {
            traitService.executeHook("onKill", attacker, defender, this.sim);
            this._broadcastAllyEvent("onAllyKill", attacker, defender);
        }

        traitService.executeHook("onPostAction", attacker, this.sim);
    }

    _broadcastAllyEvent(hookName, actor, ...args) {
        const allies = this.sim.units.filter(u => 
            u.teamId === actor.teamId && !u.isDead && u.instanceId !== actor.instanceId
        );
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
            if (neighbor) {
                traitService.executeHook("onAdjacencyGained", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyGained", neighbor, unit, this.sim);
            }
        });
    }

    performSkill(actor, skill, targetPos) {
        if (traitService.executeHook("onPreAction", actor, this.sim) === false) return;
        
        actor.consumeMana(skill.mana_cost || 0, this.sim);
        actor.skillCooldowns[skill.id] = skill.cooldown || 3;
        
        const tiles = this.sim.grid.getTilesInPattern(targetPos, skill.aoe_pattern, skill.aoe_size);
        tiles.forEach(tile => {
            const victim = this.sim.grid.unitGrid[tile.y][tile.x];
            if (victim && victim.teamId !== actor.teamId) {
                // --- AAA Skill Hook: Pre-Defend, Dodge & Block ---
                const defMods = traitService.executeHook("onPreDefend", victim, actor, this.sim) || {};
                const dodgeChance = (victim.stats.dodge_rate || 0) + (defMods.bonusDodge || 0);
                
                if (Math.random() * 100 < dodgeChance) {
                    traitService.executeHook("onDodge", victim, actor, this.sim);
                    traitService.executeHook("onAttackMissed", actor, victim, this.sim);
                    return;
                }

                const isBlocked = Math.random() < (defMods.blockChance || 0);
                if (isBlocked) {
                    traitService.executeHook("onBlock", victim, actor, this.sim);
                }

                // --- AAA Skill Hook: Pre-Attack Scaling ---
                const atkMods = traitService.executeHook("onPreAttack", actor, victim, this.sim) || {};
                const skillMult = (skill.damage_multiplier || 1.0) * (atkMods.dmgMult || 1.0) * (isBlocked ? 0.5 : 1.0);

                const result = CombatRules.calculateDamage(actor, victim, skillMult, skill.element || 0);
                
                if (result.isCrit) {
                    traitService.executeHook("onCrit", actor, victim, result.damage, this.sim);
                }

                const impactMods = traitService.executeHook("onTakeDamage", victim, actor, result.damage, this.sim) || {};
                const finalDmg = impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage;
                
                victim.takeDamage(finalDmg);
                this._broadcastAllyEvent("onAllyDamage", victim, finalDmg);
                
                traitService.executeHook("onPostHit", victim, actor, finalDmg, this.sim);
                traitService.executeHook("onPostAttack", actor, victim, finalDmg, this.sim);
                traitService.executeHook("onLifesteal", actor, finalDmg, this.sim);
                
                if (skill.status_effect) {
                    victim.applyEffect({ ...skill.status_effect }, this.sim);
                }
                if (victim.currentHealth <= 0) {
                    traitService.executeHook("onKill", actor, victim, this.sim);
                    this._broadcastAllyEvent("onAllyKill", actor, victim);
                }
            }
        });
        traitService.executeHook("onPostAction", actor, this.sim);
    }

    resolveDeaths() {
        const currentDead = this.sim.units.filter(u => !u.isDead && u.currentHealth <= 0);
        currentDead.forEach(u => {
            if (traitService.executeHook("onBeforeDeath", u, this.sim)) return;
            this._broadcastAdjacencyLost(u);
            u.isDead = true;
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