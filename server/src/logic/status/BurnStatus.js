/**
 * BurnStatus
 * Fire damage over time effect.
 * Deals damage each turn and may spread to adjacent units.
 */
const BaseStatus = require('./BaseStatus');
const { StatModifierType } = require('../statSystem');

class BurnStatus extends BaseStatus {
    constructor(duration = 3, power = 10) {
        super("BURN", duration, power, {
            priority: 50,
            stackable: true,
            maxStacks: 3,
            canDispel: true,
            isBuff: false,
            statModifiers: [
                { statKey: "fire_resistance", value: -0.1, type: StatModifierType.FLAT }
            ]
        });
        
        this.damagePerTick = power;
        this.spreadChance = 0.2; // 20% chance to spread
    }

    _onTickCustom(unit, sim) {
        // Calculate fire damage (affected by fire_damage stat)
        const fireDamageBonus = unit.getStat("fire_damage") || 0;
        const actualDamage = Math.floor(this.damagePerTick * (1 + fireDamageBonus / 100));
        
        // Apply fire resistance
        const fireResistance = unit.getStat("fire_resistance") || 0;
        const resistedDamage = Math.floor(actualDamage * (1 - fireResistance));
        
        unit.takeDamage(resistedDamage, sim);
        
        // Log the burn damage
        if (sim && sim.logger) {
            sim.logger.addEvent("STATUS_DAMAGE", `${unit.data.name} takes ${resistedDamage} burn damage`, {
                target_id: unit.instanceId,
                damage: resistedDamage,
                status_type: "BURN",
                remaining_duration: this.duration
            });
        }
        
        // Try to spread to adjacent enemies
        if (sim && Math.random() < this.spreadChance) {
            this._spreadBurn(unit, sim);
        }
    }

    _spreadBurn(sourceUnit, sim) {
        if (!sim.grid) return;
        
        const neighbors = sim.grid.getNeighbors(sourceUnit.gridPos);
        for (const pos of neighbors) {
            const neighbor = sim.grid.unitGrid[pos.y]?.[pos.x];
            if (neighbor && neighbor.teamId !== sourceUnit.teamId && !neighbor.isDead) {
                // Check if neighbor already has burn
                const hasBurn = neighbor.activeEffects.some(e => e.type === "BURN");
                if (!hasBurn) {
                    const burn = new BurnStatus(this.duration, Math.floor(this.power / 2));
                    neighbor.applyEffect(burn, sim);
                    
                    if (sim.logger) {
                        sim.logger.addEvent("STATUS_SPREAD", `Burn spread to ${neighbor.data.name}`, {
                            from_id: sourceUnit.instanceId,
                            target_id: neighbor.instanceId,
                            status_type: "BURN"
                        });
                    }
                    break; // Only spread to one unit
                }
            }
        }
    }

    _onExpireCustom(unit, sim) {
        // Burn expiration effect (smoke visual, etc.)
    }

    getDescription(unit) {
        return `Burn: ${this.duration} turns, ${this.damagePerTick} fire damage/tick`;
    }
}

module.exports = BurnStatus;
