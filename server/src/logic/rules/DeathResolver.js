const traitService = require('../../services/traitService');

/**
 * DeathResolver
 * Manages unit mortality, cleanup, and vengeance hooks.
 */
class DeathResolver {
    constructor(sim) {
        this.sim = sim;
    }

    resolve() {
        const currentDead = this.sim.units.filter(u => !u.isDead && u.currentHealth <= 0);
        currentDead.forEach(u => {
            if (traitService.executeHook("onBeforeDeath", u, this.sim)) return;
            
            this.sim.rules._broadcastAdjacencyLost(u);
            u.isDead = true; 
            u.modifyAP(-u.currentActionPoints, this.sim);
            
            this.sim.grid.unitGrid[u.gridPos.y][u.gridPos.x] = null;
            traitService.executeHook("onDeath", u, this.sim);
            
            this.sim.rules._broadcastAllyEvent("onAllyDeath", u);

            if (u.teamId === 1) this.sim.killedMonsterIds.push(u.data.id);
            this.sim.rewards.gold += 15;
            this.sim.rewards.exp += (u.data.exp_reward || 10);
            this.sim.logger.addEvent("DEATH", `${u.data.name} died`, { target_id: u.instanceId });
        });
    }
}

module.exports = DeathResolver;
