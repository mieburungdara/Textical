const _ = require('lodash');
const BattleUnit = require('../battleUnit');
const traitService = require('../../services/traitService');
const worldCycle = require('../../services/world/WorldCycleService');
const envResolver = require('../world/EnvironmentalResolver');

class SimUnitManager {
    constructor(sim) {
        this.sim = sim;
    }

    async addUnit(data, teamId, pos, stats) {
        // --- AAA: Environmental Modifiers ---
        const worldState = await worldCycle.getWorldState();
        const envMods = envResolver.resolveModifiers(worldState.currentHour, worldState.weatherType);
        
        // Scale unit stats before creation
        const scaledStats = { ...stats };
        scaledStats.attack_damage = Math.floor(scaledStats.attack_damage * envMods.combat.atkMult);
        // Add more scaling here if needed (e.g. elemental)

        const unit = new BattleUnit(data, teamId, { 
            x: _.clamp(pos.x, 0, this.sim.width - 1), 
            y: _.clamp(pos.y, 0, this.sim.height - 1) 
        }, scaledStats);
        
        if (data.facing) unit.facing = data.facing;
        this.sim.units.push(unit);
        this.sim.grid.unitGrid[unit.gridPos.y][unit.gridPos.x] = unit;
        this.notifyAdjacencyGained(unit);
        return unit;
    }

    notifyAdjacencyGained(unit) {
        const neighbors = this.sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(nPos => {
            const neighbor = this.sim.grid.unitGrid[nPos.y][nPos.x];
            if (neighbor && !neighbor.isDead) {
                traitService.executeHook("onAdjacencyGained", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyGained", neighbor, unit, this.sim);
            }
        });
    }

    notifyAdjacencyLost(unit) {
        const neighbors = this.sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(nPos => {
            const neighbor = this.sim.grid.unitGrid[nPos.y][nPos.x];
            if (neighbor) {
                traitService.executeHook("onAdjacencyLost", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyLost", neighbor, unit, this.sim);
            }
        });
    }
}

module.exports = SimUnitManager;
