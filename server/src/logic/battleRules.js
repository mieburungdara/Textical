const CombatRules = require('./combatRules');

class BattleRules {
    /**
     * @param {Object} sim 
     */
    constructor(sim) {
        this.sim = sim;
    }

    /**
     * @param {Object} attacker 
     * @param {Object} defender 
     */
    performAttack(attacker, defender) {
        const result = CombatRules.calculateDamage(attacker, defender);
        defender.takeDamage(result.damage);
        if (result.effect) defender.activeEffects.push({ type: result.effect, duration: 3 });

        this.sim.logger.addEntry(this.sim.currentTick, "ATTACK", `${attacker.data.name} hit ${defender.data.name}`, this.sim.units, {
            actor_id: attacker.instanceId,
            target_id: defender.instanceId,
            damage: result.damage,
            is_hit: result.isHit,
            is_crit: result.isCrit,
            target_hp_left: defender.currentHealth
        });
    }

    /**
     * @param {Object} actor 
     * @param {Object} skill 
     * @param {Object} targetPos 
     */
    performSkill(actor, skill, targetPos) {
        actor.consumeMana(skill.mana_cost || 0);
        actor.skillCooldowns[skill.id] = skill.cooldown || 3;
        
        const affectedTiles = this.sim.grid.getTilesInPattern(targetPos, skill.aoe_pattern, skill.aoe_size);
        const hitIds = [];
        const individualHits = {};

        affectedTiles.forEach(tile => {
            const victim = this.sim.grid.unitGrid[tile.y][tile.x];
            if (victim && victim.teamId !== actor.teamId) {
                const result = CombatRules.calculateDamage(actor, victim, skill.damage_multiplier || 1.0, skill.element || 0);
                victim.takeDamage(result.damage);
                hitIds.push(victim.instanceId);
                individualHits[victim.instanceId] = result.damage;
                if (result.effect) victim.activeEffects.push({ type: result.effect, duration: 3 });
            }
        });

        this.sim.logger.addEntry(this.sim.currentTick, "CAST_SKILL", `${actor.data.name} cast ${skill.name}`, this.sim.units, {
            actor_id: actor.instanceId,
            target_pos: targetPos,
            skill_name: skill.name,
            result: { hit_ids: hitIds, individual_hits: individualHits }
        });
    }

    resolveDeaths() {
        this.sim.units.forEach(u => {
            if (!u.isDead && u.currentHealth <= 0) {
                u.isDead = true;
                this.sim.grid.unitGrid[u.gridPos.y][u.gridPos.x] = null;
                if (u.teamId === 1) this.sim.killedMonsterIds.push(u.data.id);
                this.sim.rewards.gold += 15;
                this.sim.rewards.exp += (u.data.exp_reward || 10);
                
                this.sim.logger.addEntry(this.sim.currentTick, "DEATH", `${u.data.name} died`, this.sim.units, { 
                    target_id: u.instanceId 
                });
            }
        });
    }

    checkWinCondition() {
        const teamsAlive = new Set(this.sim.units.filter(u => !u.isDead).map(u => u.teamId));
        if (teamsAlive.size <= 1) {
            this.sim.isFinished = true;
            this.sim.winnerTeam = Array.from(teamsAlive)[0] ?? -1;
            this.sim.logger.addEntry(this.sim.currentTick, "GAME_OVER", `Battle Finished`, this.sim.units, { 
                winner: this.sim.winnerTeam 
            });
            return true;
        }
        return false;
    }
}

module.exports = BattleRules;