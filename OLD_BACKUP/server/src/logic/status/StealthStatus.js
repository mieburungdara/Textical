/**
 * StealthStatus
 * Invisibility effect - unit cannot be targeted by most attacks.
 * Attacking reveals the unit.
 */
const BaseStatus = require('./BaseStatus');
const { StatModifierType } = require('../statSystem');

class StealthStatus extends BaseStatus {
    constructor(duration = 2, power = 50) {
        super("STEALTH", duration, power, {
            priority: 90, // High priority
            stackable: false,
            canDispel: true,
            isBuff: true,
            statModifiers: [
                { statKey: "stealth_level", value: power, type: StatModifierType.FLAT },
                { statKey: "dodge_rate", value: 0.1, type: StatModifierType.PERCENT } // Bonus dodge while stealthed
            ]
        });
        
        this.stealthLevel = power;
        this.breaksOnAttack = true; // Attacking reveals unit
    }

    _onApplyCustom(unit, sim) {
        unit.isStealthed = true;
        
        if (sim && sim.logger) {
            sim.logger.addEvent("STATUS_APPLIED", `${unit.data.name} entered stealth`, {
                target_id: unit.instanceId,
                status_type: "STEALTH",
                stealth_level: this.stealthLevel
            });
        }
    }

    _onTickCustom(unit, sim) {
        // Stealth maintained - unit cannot be targeted normally
    }

    _onExpireCustom(unit, sim) {
        unit.isStealthed = false;
        
        if (sim && sim.logger) {
            sim.logger.addEvent("STATUS_EXPIRED", `${unit.data.name} is no longer stealthed`, {
                target_id: unit.instanceId,
                status_type: "STEALTH"
            });
        }
    }

    /**
     * Break stealth (called when unit attacks)
     */
    breakStealth(unit, sim) {
        if (!this.breaksOnAttack) return;
        
        unit.isStealthed = false;
        this.duration = 0; // Expire immediately
        
        if (sim && sim.logger) {
            sim.logger.addEvent("STEALTH_BROKEN", `${unit.data.name} revealed by attacking`, {
                target_id: unit.instanceId
            });
        }
    }

    getDescription(unit) {
        return `Stealth: ${this.duration} turns, invisible (breaks on attack)`;
    }
}

module.exports = StealthStatus;
