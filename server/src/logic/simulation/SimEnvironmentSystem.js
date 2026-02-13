const traitService = require('../../services/traitService');
const environmentalResolver = require('../world/EnvironmentalResolver');

class SimEnvironmentSystem {
    constructor(sim) {
        this.sim = sim;
    }

    /**
     * AAA: Apply Global Environmental Modifiers (Night/Moon Phase)
     */
    applyEnvironmentalModifiers() {
        const hour = this.sim.currentHour || 12;
        const weather = this.sim.weather || "CLEAR";
        const moonPhase = this.sim.moonPhase || "NEW";

        const envMods = environmentalResolver.resolveModifiers(hour, weather, moonPhase);
        
        for (const unit of this.sim.units.filter(u => !u.isDead)) {
            // Apply Combat Multipliers
            unit.temporaryStats.attack_damage = (unit.temporaryStats.attack_damage || 0) + 
                (unit.stats.attack_damage * (envMods.combat.atkMult - 1));
            
            unit.temporaryStats.defense = (unit.temporaryStats.defense || 0) + 
                (unit.stats.defense * (envMods.combat.defMult - 1));

            // AAA: Stealth Strike Bonus (Night Only, First 5 ticks)
            const isNight = hour < 6 || hour >= 20;
            if (isNight && unit.teamId === 0 && this.sim.currentTick < 5) {
                // Initial ambush bonus
                unit.temporaryStats.attack_damage += unit.stats.attack_damage * 0.25;
                if (this.sim.currentTick === 0) {
                    this.sim.logger.log(`[ENV] ${unit.data.name} benefits from Stealth Strike!`, "INFO");
                }
            }

            // Apply Stat Modifiers from Environment
            for (const mod of envMods.statModifiers) {
                const baseValue = unit.stats[mod.statKey] || 0;
                const bonus = mod.isPercent ? (baseValue * mod.value) : mod.value;
                unit.temporaryStats[mod.statKey] = (unit.temporaryStats[mod.statKey] || 0) + bonus;
            }
        }
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
