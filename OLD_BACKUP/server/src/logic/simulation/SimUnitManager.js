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
        
        // AAA: Summoning Potency (v8.0)
        const intensity = this.sim.manaStaticIntensity || 1.0;
        if (data.isSummon && intensity > 1.0) {
            const bonusMult = 1.0 + (intensity - 1.0) * 0.2; // e.g. Intensity 2.0 -> 20% bonus
            scaledStats.health_max = Math.floor(scaledStats.health_max * bonusMult);
            scaledStats.attack_damage = Math.floor(scaledStats.attack_damage * bonusMult);
            scaledStats.speed = Math.floor(scaledStats.speed * bonusMult);
        }

        // AAA: Tile Occupancy Check - Find nearest empty tile if spawn is occupied
        let targetX = _.clamp(pos.x, 0, this.sim.width - 1);
        let targetY = _.clamp(pos.y, 0, this.sim.height - 1);
        
        if (this.sim.grid.isTileOccupied(targetX, targetY)) {
            // Find neighbor or random empty nearby
            const neighbors = this.sim.grid.getNeighbors({ x: targetX, y: targetY });
            const free = neighbors.find(n => !this.sim.grid.isTileOccupied(n.x, n.y));
            if (free) {
                targetX = free.x;
                targetY = free.y;
            } else {
                // Fallback to searching nearby
                for (let r = 1; r < 5; r++) {
                    let found = false;
                    for (let dx = -r; dx <= r; dx++) {
                        for (let dy = -r; dy <= r; dy++) {
                            const nx = _.clamp(targetX + dx, 0, this.sim.width - 1);
                            const ny = _.clamp(targetY + dy, 0, this.sim.height - 1);
                            if (!this.sim.grid.isTileOccupied(nx, ny)) {
                                targetX = nx; targetY = ny;
                                found = true; break;
                            }
                        }
                        if (found) break;
                    }
                    if (found) break;
                }
            }
        }

        const unit = new BattleUnit(data, teamId, { x: targetX, y: targetY }, scaledStats);
        
        if (data.facing) unit.facing = data.facing;
        this.sim.units.push(unit);
        this.sim.grid.unitGrid[unit.gridPos.y][unit.gridPos.x] = unit;
        this.sim.grid.addObstacle(unit.gridPos.x, unit.gridPos.y);
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
