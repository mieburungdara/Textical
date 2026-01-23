/**
 * Professional AAA-Grade Traits Manager
 * Comprehensive Life-Cycle Hooks.
 */
class TraitsManager {
    constructor() {
        this.traits = {
            "vampire": {
                onAfterAttack: (attacker, defender, result, sim) => {
                    if (result.damage > 0) {
                        const heal = Math.floor(result.damage * 0.30);
                        attacker.currentHealth = Math.min(attacker.stats.health_max, attacker.currentHealth + heal);
                        sim.logger.addEntry(sim.currentTick, "HEAL", `${attacker.data.name} leeches life`, sim.units, { actor_id: attacker.instanceId, amount: heal });
                    }
                }
            },
            "orc": {
                onKill: (attacker, victim, sim) => {
                    // Bloodlust: Gain 20 Action Points on kill to act faster again
                    attacker.currentActionPoints += 20.0;
                    sim.logger.addEntry(sim.currentTick, "VFX", `${attacker.data.name} is energized by blood!`, sim.units, { actor_id: attacker.instanceId, vfx: "bloodlust" });
                }
            },
            "angel": {
                onTurnEnd: (unit, sim) => {
                    // Holy Aura: Heal nearby allies for 5% of their max HP
                    const allies = sim.units.filter(u => !u.isDead && u.teamId === unit.teamId && u !== unit);
                    allies.forEach(ally => {
                        if (sim.grid.getDistance(unit.gridPos, ally.gridPos) <= 2) {
                            const heal = Math.floor(ally.stats.health_max * 0.05);
                            ally.currentHealth = Math.min(ally.stats.health_max, ally.currentHealth + heal);
                            sim.logger.addEntry(sim.currentTick, "HEAL", `${unit.data.name}'s Holy Aura`, sim.units, { actor_id: ally.instanceId, amount: heal });
                        }
                    });
                }
            },
            "slime": {
                onDeath: (unit, sim) => {
                    if (!unit.data.is_mini) this._handleSlimeSplit(unit, sim);
                },
                onMoveEnd: (unit, sim) => {
                    // Leaves a trail of MUD (ID 1)
                    sim.grid.terrainGrid[unit.gridPos.y][unit.gridPos.x] = 1;
                }
            },
            "demon": {
                onTurnStart: (unit, sim) => {
                    // Demonic Pact: Lose 2% HP, gain 10% more Damage for this turn
                    const sacrifice = Math.floor(unit.currentHealth * 0.02);
                    unit.takeDamage(sacrifice);
                    return { temporaryDamageMult: 1.10 };
                }
            },
            "automaton": {
                onTakeDamage: (victim, amount, sim) => {
                    return { finalDamage: Math.max(1, amount - 5) };
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
                const child = sim.addUnit({ ...parent.data, name: `Mini ${parent.data.name}`, is_mini: true, instance_id: `${parent.instanceId}_m${count}`, race: "slime" }, parent.teamId, pos, miniStats);
                sim.logger.addEntry(sim.currentTick, "SUMMON", `${child.data.name} split from parent`, sim.units, { actor_id: child.instanceId });
                count++;
            }
        });
    }
}

module.exports = new TraitsManager();
