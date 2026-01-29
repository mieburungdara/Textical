const traitService = require('../../services/traitService');

class SimEnvironmentSystem {
    constructor(sim) {
        this.sim = sim;
    }

    applyTerrainEffects() {
        if (!this.sim.terrainEffects || this.sim.terrainEffects.length === 0) return;
        
        for (const unit of this.sim.units.filter(u => !u.isDead)) {
            const tileId = this.sim.grid.terrainGrid[unit.gridPos.y][unit.gridPos.x];
            
            for (const eff of this.sim.terrainEffects) {
                const isLavaEffect = eff.effectType === "BURN" && tileId === 6;
                const isGeneralEffect = !eff.requiredTileId || eff.requiredTileId === tileId;

                if (!isLavaEffect && !isGeneralEffect) continue;
                if (this.sim.currentTick % eff.tickInterval !== 0) continue;
                if (Math.random() > eff.chance) continue;

                switch (eff.effectType) {
                    case "BURN":
                        const BurnStatus = require('../status/definitions/Burn');
                        unit.applyEffect(new BurnStatus(3, eff.power), this.sim);
                        break;
                    case "HEAL":
                        unit.currentHealth = Math.min(unit.stats.health_max, unit.currentHealth + eff.power);
                        traitService.executeHook("onHealthRegen", unit, eff.power, this.sim);
                        break;
                    case "DRAIN":
                        const impactMods = traitService.executeHook("onTakeDamage", unit, null, eff.power, this.sim) || {};
                        const finalDmg = impactMods.finalDamage !== undefined ? impactMods.finalDamage : eff.power;
                        unit.takeDamage(finalDmg);
                        traitService.executeHook("onPostHit", unit, null, finalDmg, this.sim);
                        break;
                }
            }
        }
    }

    applyAuras() {
        for (const unit of this.sim.units.filter(u => !u.isDead)) {
            const allies = this.sim.units.filter(u => !u.isDead && u.teamId === unit.teamId && u.instanceId !== unit.instanceId);
            for (const ally of allies) {
                const dist = this.sim.grid.getDistance(unit.gridPos, ally.gridPos);
                if (dist <= 1) unit.temporaryStats.defense = (unit.temporaryStats.defense || 0) + 5;
            }
        }
    }
}

module.exports = SimEnvironmentSystem;
