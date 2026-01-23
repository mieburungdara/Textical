const CombatRules = require('./combatRules');
const traitService = require('../services/traitService'); // UPDATED

class BattleRules {
    constructor(sim) {
        this.sim = sim;
    }

    performAttack(attacker, defender) {
        if (traitService.executeHook("onBeforeAction", attacker, this.sim) === false) return;

        const aTerrain = this.sim.grid.terrainGrid[attacker.gridPos.y][attacker.gridPos.x];
        const dTerrain = this.sim.grid.terrainGrid[defender.gridPos.y][defender.gridPos.x];

        const impact = traitService.executeHook("onActionImpact", attacker, defender, this.sim) || {};
        if (impact.cancelAction) return;

        const dmgMult = (impact.dmgMult || 1.0) * (attacker.tempDamageMult || 1.0);
        let result = CombatRules.calculateDamage(attacker, defender, dmgMult, 0, aTerrain, dTerrain);
        
        const defMods = traitService.executeHook("onTakeDamage", defender, result.damage, this.sim) || {};
        const finalDamage = defMods.finalDamage !== undefined ? defMods.finalDamage : result.damage;

        defender.takeDamage(finalDamage);
        traitService.executeHook("onLifesteal", attacker, finalDamage, this.sim);

        this.sim.logger.addEntry(this.sim.currentTick, "ATTACK", `${attacker.data.name} hit ${defender.data.name}`, this.sim.units, {
            actor_id: attacker.instanceId, target_id: defender.instanceId, damage: finalDamage
        });

        if (defender.currentHealth <= 0) traitService.executeHook("onKill", attacker, defender, this.sim);
    }

    performSkill(actor, skill, targetPos) {
        if (traitService.executeHook("onBeforeAction", actor, this.sim) === false) return;
        actor.consumeMana(skill.mana_cost || 0);
        actor.skillCooldowns[skill.id] = skill.cooldown || 3;
        
        const tiles = this.sim.grid.getTilesInPattern(targetPos, skill.aoe_pattern, skill.aoe_size);
        const hitIds = [];

        tiles.forEach(tile => {
            const victim = this.sim.grid.unitGrid[tile.y][tile.x];
            if (victim && victim.teamId !== actor.teamId) {
                const result = CombatRules.calculateDamage(actor, victim, skill.damage_multiplier || 1.0, skill.element || 0);
                const defMods = traitService.executeHook("onTakeDamage", victim, result.damage, this.sim) || {};
                const finalDmg = defMods.finalDamage !== undefined ? defMods.finalDamage : result.damage;
                victim.takeDamage(finalDmg);
                traitService.executeHook("onLifesteal", actor, finalDmg, this.sim);
                hitIds.push(victim.instanceId);
                if (victim.currentHealth <= 0) traitService.executeHook("onKill", actor, victim, this.sim);
            }
        });

        this.sim.logger.addEntry(this.sim.currentTick, "CAST_SKILL", `${actor.data.name} cast ${skill.name}`, this.sim.units, {
            actor_id: actor.instanceId, target_pos: targetPos, skill_name: skill.name, result: { hit_ids: hitIds }
        });
    }

    resolveDeaths() {
        const currentDead = this.sim.units.filter(u => !u.isDead && u.currentHealth <= 0);
        currentDead.forEach(u => {
            if (traitService.executeHook("onBeforeDeath", u, this.sim)) return;
            u.isDead = true;
            this.sim.grid.unitGrid[u.gridPos.y][u.gridPos.x] = null;
            traitService.executeHook("onDeath", u, this.sim);
            if (u.teamId === 1) this.sim.killedMonsterIds.push(u.data.id);
            this.sim.rewards.gold += 15;
            this.sim.rewards.exp += (u.data.exp_reward || 10);
            this.sim.logger.addEntry(this.sim.currentTick, "DEATH", `${u.data.name} died`, this.sim.units, { target_id: u.instanceId });
        });
    }

    checkWinCondition() {
        const aliveTeams = new Set(this.sim.units.filter(u => !u.isDead).map(u => u.teamId));
        if (aliveTeams.size <= 1) {
            this.sim.isFinished = true;
            this.sim.winnerTeam = Array.from(aliveTeams)[0] ?? -1;
            this.sim.units.forEach(u => traitService.executeHook("onBattleEnd", u, this.sim));
            this.sim.logger.addEntry(this.sim.currentTick, "GAME_OVER", `Battle Finished`, this.sim.units, { winner: this.sim.winnerTeam });
            return true;
        }
        return false;
    }
}

module.exports = BattleRules;