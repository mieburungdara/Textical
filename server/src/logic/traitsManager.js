/**
 * AAA-Grade Trait Manager
 * Standardized Hook Names for BattleRules.
 */
class TraitsManager {
    constructor() {
        this.traits = {
            "vampire": {
                onLifesteal: (attacker, damage, sim) => {
                    if (damage > 0) {
                        const heal = Math.floor(damage * 0.30);
                        attacker.currentHealth = Math.min(attacker.stats.health_max, attacker.currentHealth + heal);
                        sim.logger.addEntry(sim.currentTick, "HEAL", `${attacker.data.name} leeches life`, sim.units, { actor_id: attacker.instanceId, amount: heal });
                    }
                }
            },
            "slime": {
                onDeath: (unit, sim) => {
                    if (!unit.data.is_mini) this._handleSlimeSplit(unit, sim);
                }
            },
            "orc": {
                onKill: (attacker, victim, sim) => {
                    attacker.currentActionPoints += 20.0;
                    sim.logger.addEntry(sim.currentTick, "VFX", `${attacker.data.name} is energized by blood!`, sim.units, { actor_id: attacker.instanceId, vfx: "bloodlust" });
                }
            },
            "skeleton": {
                onTurnStart: (unit, sim) => {
                    unit.activeEffects = unit.activeEffects.filter(e => e.type !== "poison" && e.type !== "burn");
                },
                onBeforeDeath: (unit, sim) => {
                    if (!unit.data.did_revive && Math.random() < 0.20) {
                        unit.currentHealth = 1;
                        unit.data.did_revive = true;
                        sim.logger.addEntry(sim.currentTick, "VFX", `${unit.data.name} refused to die!`, sim.units, { actor_id: unit.instanceId, vfx: "revive" });
                        return true; // Cancel death
                    }
                    return false;
                }
            }
        };
    }

    executeHook(hookName, actor, ...args) {
        const raceTrait = this.traits[actor.race];
        if (raceTrait && raceTrait[hookName]) {
            return raceTrait[hookName](actor, ...args);
        }
        return null;
    }

    _handleSlimeSplit(parent, sim) {
        const neighbors = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
        let count = 0;
        neighbors.forEach(n => {
            if (count >= 2) return;
            const pos = { x: parent.gridPos.x + n.x, y: parent.gridPos.y + n.y };
            if (!sim.grid.isTileOccupied(pos.x, pos.y)) {
                const miniStats = { ...parent.stats };
                miniStats.health_max = Math.floor(parent.stats.health_max * 0.4);
                sim.addUnit({ ...parent.data, name: `Mini ${parent.data.name}`, is_mini: true, instance_id: `${parent.instanceId}_m${count}`, race: "slime" }, parent.teamId, pos, miniStats);
                count++;
            }
        });
    }
}

module.exports = new TraitsManager();