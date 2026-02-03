/**
 * ShieldStatus
 * Damage absorption effect - blocks damage until shield is depleted.
 */
const BaseStatus = require('./BaseStatus');
const { StatModifierType } = require('../statSystem');

class ShieldStatus extends BaseStatus {
    constructor(duration, power, options = {}) {
        super("SHIELD", duration, power, {
            priority: 200, // Highest priority - processes first
            stackable: options.stackable || false,
            maxStacks: options.maxStacks || 5,
            canDispel: true,
            isBuff: true,
            statModifiers: []
        });
        
        this.shieldAmount = power;
        this.maxShield = power;
        this.shieldType = options.shieldType || "BARRIER"; // BARRIER, MANA_SHIELD, etc.
        this.absorbType = options.absorbType || "ALL"; // ALL, PHYSICAL, MAGICAL, ELEMENTAL
        this.elementType = options.elementType || null; // FIRE, WATER, etc. for elemental shields
    }

    _onApplyCustom(unit, sim) {
        if (sim && sim.logger) {
            sim.logger.addEvent("STATUS_APPLIED", `${unit.data.name} gained ${this.shieldAmount} shield`, {
                target_id: unit.instanceId,
                status_type: "SHIELD",
                shield_amount: this.shieldAmount,
                shield_type: this.shieldType
            });
        }
    }

    _onTickCustom(unit, sim) {
        // Shield doesn't do anything on tick except wait for damage
        // Shield depletes when taking damage (handled in damage calculation)
    }

    /**
     * Absorb damage - returns amount absorbed
     */
    absorbDamage(amount, unit, sim) {
        if (this.shieldAmount <= 0) return 0;
        
        const absorbed = Math.min(this.shieldAmount, amount);
        this.shieldAmount -= absorbed;
        
        if (sim && sim.logger) {
            sim.logger.addEvent("SHIELD_ABSORB", `Shield absorbed ${absorbed} damage`, {
                target_id: unit.instanceId,
                absorbed: absorbed,
                remaining: this.shieldAmount
            });
        }
        
        // Check if shield depleted
        if (this.shieldAmount <= 0) {
            this.duration = 0; // Expire shield
        }
        
        return absorbed;
    }

    _onExpireCustom(unit, sim) {
        // Shield wore off
        if (sim && sim.logger) {
            sim.logger.addEvent("STATUS_EXPIRED", `${unit.data.name}'s shield expired`, {
                target_id: unit.instanceId,
                status_type: "SHIELD",
                original_shield: this.maxShield
            });
        }
    }

    getDescription(unit) {
        return `Shield: ${this.shieldAmount}/${this.maxShield} (${this.shieldType})`;
    }
}

module.exports = ShieldStatus;
