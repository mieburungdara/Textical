const CombatRules = require('./combatRules');
const TraitsManager = require('./traitsManager');

class BattleRules {
    constructor(sim) {
        this.sim = sim;
    }

    performAttack(attacker, defender) {
        // 8. HOOK: Before Action
        if (TraitsManager.executeHook("onBeforeAction", attacker, this.sim) === false) return;

        const aTerrain = this.sim.grid.terrainGrid[attacker.gridPos.y][attacker.gridPos.x];
        const dTerrain = this.sim.grid.terrainGrid[defender.gridPos.y][defender.gridPos.x];

        // 9. HOOK: Action Impact (Block/Parry)
        const impact = TraitsManager.executeHook("onActionImpact", attacker, defender, this.sim) || {};
        if (impact.cancelAction) return;

        const dmgMult = (impact.dmgMult || 1.0) * (attacker.tempDamageMult || 1.0);
        let result = CombatRules.calculateDamage(attacker, defender, dmgMult, 0, aTerrain, dTerrain);
        
        // 10. HOOK: Damage Calculation (Elemental tweaks)
        const calcMods = TraitsManager.executeHook("onDamageCalculation", attacker, defender, result, this.sim) || {};
        result.damage = calcMods.finalDamage || result.damage;

        // 11. HOOK: Before Damage (Shields)
        const preDamage = TraitsManager.executeHook("onBeforeDamage", defender, result.damage, this.sim) || {};
        let damageToApply = preDamage.modifiedDamage !== undefined ? preDamage.modifiedDamage : result.damage;

        // 12. HOOK: Take Damage (Armor)
        const takeDamageMods = TraitsManager.executeHook("onTakeDamage", defender, damageToApply, this.sim) || {};
        damageToApply = takeDamageMods.finalDamage !== undefined ? takeDamageMods.finalDamage : damageToApply;

        defender.takeDamage(damageToApply);

        // 13. HOOK: Post Damage (Thorns)
        TraitsManager.executeHook("onPostDamage", defender, attacker, damageToApply, this.sim);

        // 15. HOOK: Lifesteal
        TraitsManager.executeHook("onLifesteal", attacker, damageToApply, this.sim);

        this.sim.logger.addEntry(this.sim.currentTick, "ATTACK", `${attacker.data.name} hit ${defender.data.name}`, this.sim.units, {
            actor_id: attacker.instanceId,
            target_id: defender.instanceId,
            damage: damageToApply,
            is_hit: result.isHit,
            is_crit: result.isCrit
        });

        if (defender.currentHealth <= 0) {
            TraitsManager.executeHook("onKill", attacker, defender, this.sim);
            
            // RECORD DEED: Kill
            const actorDeeds = this.sim.unitDeeds[attacker.instanceId] || {};
            const key = `kills_${defender.race || 'unknown'}`;
            actorDeeds[key] = (actorDeeds[key] || 0) + 1;
            this.sim.unitDeeds[attacker.instanceId] = actorDeeds;
        }
    }

    performSkill(actor, skill, targetPos) {
        if (TraitsManager.executeHook("onBeforeAction", actor, this.sim) === false) return;

        actor.consumeMana(skill.mana_cost || 0);
        actor.skillCooldowns[skill.id] = skill.cooldown || 3;
        
        const affectedTiles = this.sim.grid.getTilesInPattern(targetPos, skill.aoe_pattern, skill.aoe_size);
        const hitIds = [];

        affectedTiles.forEach(tile => {
            const victim = this.sim.grid.unitGrid[tile.y][tile.x];
            if (victim && victim.teamId !== actor.teamId) {
                const result = CombatRules.calculateDamage(actor, victim, skill.damage_multiplier || 1.0, skill.element || 0);
                
                // Simplified hook call for AoE
                const takeDamageMods = TraitsManager.executeHook("onTakeDamage", victim, result.damage, this.sim) || {};
                const finalDmg = takeDamageMods.finalDamage !== undefined ? takeDamageMods.finalDamage : result.damage;
                
                victim.takeDamage(finalDmg);
                TraitsManager.executeHook("onLifesteal", actor, finalDmg, this.sim);
                
                hitIds.push(victim.instanceId);
                if (victim.currentHealth <= 0) TraitsManager.executeHook("onKill", actor, victim, this.sim);
            }
        });

        this.sim.logger.addEntry(this.sim.currentTick, "CAST_SKILL", `${actor.data.name} cast ${skill.name}`, this.sim.units, {
            actor_id: actor.instanceId,
            target_pos: targetPos,
            skill_name: skill.name,
            result: { hit_ids: hitIds }
        });
    }

    resolveDeaths() {
        const currentDead = this.sim.units.filter(u => !u.isDead && u.currentHealth <= 0);
        currentDead.forEach(u => {
            // 17. HOOK: Before Death (Last Stand)
            const saved = TraitsManager.executeHook("onBeforeDeath", u, this.sim);
            if (saved) return;

            u.isDead = true;
            this.sim.grid.unitGrid[u.gridPos.y][u.gridPos.x] = null;
            
            // 18. HOOK: On Death (Split/Explode)
            TraitsManager.executeHook("onDeath", u, this.sim);

            if (u.teamId === 1) this.sim.killedMonsterIds.push(u.data.id);
            this.sim.rewards.gold += 15;
            this.sim.rewards.exp += (u.data.exp_reward || 10);
            this.sim.logger.addEntry(this.sim.currentTick, "DEATH", `${u.data.name} died`, this.sim.units, { target_id: u.instanceId });
        });
    }

    checkWinCondition() {
        const teamsAlive = new Set(this.sim.units.filter(u => !u.isDead).map(u => u.teamId));
        if (teamsAlive.size <= 1) {
            this.sim.isFinished = true;
            this.sim.winnerTeam = Array.from(teamsAlive)[0] ?? -1;
            // 20. HOOK: Battle End
            this.sim.units.forEach(u => TraitsManager.executeHook("onBattleEnd", u, this.sim));
            this.sim.logger.addEntry(this.sim.currentTick, "GAME_OVER", `Battle Finished`, this.sim.units, { winner: this.sim.winnerTeam });
            return true;
        }
        return false;
    }
}

module.exports = BattleRules;
