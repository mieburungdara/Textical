const CombatRules = require('./combatRules');
const traitService = require('../services/traitService'); 

class BattleRules {
    constructor(sim) {
        this.sim = sim;
    }

    performAttack(attacker, defender) {
        // 1. Pre-Action Lifecycle
        if (traitService.executeHook("onPreAction", attacker, this.sim) === false) return;

        // 2. Pre-Combat Micro-Phases
        const atkMods = traitService.executeHook("onPreAttack", attacker, defender, this.sim) || {};
        const defMods = traitService.executeHook("onPreDefend", defender, attacker, this.sim) || {};

        if (atkMods.cancelAction || defMods.cancelAction) return;

        // 3. Dodge & Accuracy Roll
        const dodgeChance = (defender.stats.dodge_rate || 0) + (defMods.bonusDodge || 0);
        if (Math.random() * 100 < dodgeChance) {
            traitService.executeHook("onDodge", defender, attacker, this.sim);
            traitService.executeHook("onAttackMissed", attacker, defender, this.sim);
            this.sim.logger.addEvent("MISS", `${defender.data.name} dodged the strike!`, { target_id: defender.instanceId });
            return;
        }

        // 4. Hit Calculation
        const aTerrain = this.sim.grid.terrainGrid[attacker.gridPos.y][attacker.gridPos.x];
        const dTerrain = this.sim.grid.terrainGrid[defender.gridPos.y][defender.gridPos.x];
        const dmgMult = (atkMods.dmgMult || 1.0) * (attacker.tempDamageMult || 1.0);
        
        let result = CombatRules.calculateDamage(attacker, defender, dmgMult, 0, aTerrain, dTerrain);
        
        // 5. Critical Strike Hook
        if (result.isCrit) {
            traitService.executeHook("onCrit", attacker, defender, result.damage, this.sim);
        }

        // 6. Mitigation & Reflect Hook
        const impactMods = traitService.executeHook("onTakeDamage", defender, attacker, result.damage, this.sim) || {};
        const finalDamage = impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage;

        // 7. Apply Physical Change
        defender.takeDamage(finalDamage);
        this.sim.unitDeeds[attacker.instanceId] = (this.sim.unitDeeds[attacker.instanceId] || 0) + finalDamage;

        // 8. Post-Impact Life Cycle
        traitService.executeHook("onPostHit", defender, attacker, finalDamage, this.sim);
        traitService.executeHook("onPostAttack", attacker, defender, finalDamage, this.sim);
        traitService.executeHook("onLifesteal", attacker, finalDamage, this.sim);

        // --- Knockback Logic (Modularized in future as a Trait) ---
        let knockbackData = null;
        if (Math.random() < 0.15 && !defender.isDead) {
            const dx = Math.sign(defender.gridPos.x - attacker.gridPos.x);
            const dy = Math.sign(defender.gridPos.y - attacker.gridPos.y);
            const nextX = defender.gridPos.x + dx;
            const nextY = defender.gridPos.y + dy;
            if (!this.sim.grid.isTileOccupied(nextX, nextY)) {
                const oldPos = { ...defender.gridPos };
                this.sim.grid.unitGrid[oldPos.y][oldPos.x] = null;
                defender.gridPos = { x: nextX, y: nextY };
                this.sim.grid.unitGrid[nextY][nextX] = defender;
                knockbackData = { from: oldPos, to: { x: nextX, y: nextY } };
            }
        }

        this.sim.logger.addEvent("ATTACK", `${attacker.data.name} hit ${defender.data.name}`, {
            actor_id: attacker.instanceId, 
            target_id: defender.instanceId, 
            damage: finalDamage,
            is_crit: result.isCrit,
            knockback: knockbackData
        });

        // 9. Kill Life Cycle
        if (defender.currentHealth <= 0) {
            traitService.executeHook("onKill", attacker, defender, this.sim);
        }

        traitService.executeHook("onPostAction", attacker, this.sim);
    }

    performSkill(actor, skill, targetPos) {
        if (traitService.executeHook("onPreAction", actor, this.sim) === false) return;
        
        actor.consumeMana(skill.mana_cost || 0);
        traitService.executeHook("onManaSpend", actor, skill.mana_cost || 0, this.sim);
        actor.skillCooldowns[skill.id] = skill.cooldown || 3;
        
        const tiles = this.sim.grid.getTilesInPattern(targetPos, skill.aoe_pattern, skill.aoe_size);
        const hitIds = [];

        tiles.forEach(tile => {
            const victim = this.sim.grid.unitGrid[tile.y][tile.x];
            if (victim && victim.teamId !== actor.teamId) {
                const result = CombatRules.calculateDamage(actor, victim, skill.damage_multiplier || 1.0, skill.element || 0);
                const impactMods = traitService.executeHook("onTakeDamage", victim, actor, result.damage, this.sim) || {};
                const finalDmg = impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage;
                
                victim.takeDamage(finalDmg);
                traitService.executeHook("onPostHit", victim, actor, finalDmg, this.sim);
                traitService.executeHook("onLifesteal", actor, finalDmg, this.sim);
                
                if (skill.status_effect) {
                    const eff = { ...skill.status_effect };
                    if (traitService.executeHook("onStatusApplied", victim, eff, this.sim) !== false) {
                        if (eff.type === "PROVOKED") eff.provokerId = actor.instanceId;
                        victim.applyEffect(eff);
                    }
                }

                hitIds.push(victim.instanceId);
                if (victim.currentHealth <= 0) traitService.executeHook("onKill", actor, victim, this.sim);
            }
        });

        this.sim.logger.addEvent("CAST_SKILL", `${actor.data.name} cast ${skill.name}`, {
            actor_id: actor.instanceId, 
            target_pos: targetPos, 
            skill_name: skill.name, 
            impact_tiles: tiles,
            result: { hit_ids: hitIds }
        });

        traitService.executeHook("onPostAction", actor, this.sim);
    }

    resolveDeaths() {
        const currentDead = this.sim.units.filter(u => !u.isDead && u.currentHealth <= 0);
        currentDead.forEach(u => {
            if (traitService.executeHook("onBeforeDeath", u, this.sim)) return;
            u.isDead = true;
            this.sim.grid.unitGrid[u.gridPos.y][u.gridPos.x] = null;
            traitService.executeHook("onDeath", u, this.sim);
            
            // Synergy Hook: Notify team of death
            const allies = this.sim.units.filter(a => a.teamId === u.teamId && !a.isDead && a.instanceId !== u.instanceId);
            allies.forEach(a => traitService.executeHook("onAllyDeath", a, u, this.sim));

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
            this.sim.logger.addEvent("GAME_OVER", `Battle Finished`, { winner: this.sim.winnerTeam });
            return true;
        }
        return false;
    }
}

module.exports = BattleRules;