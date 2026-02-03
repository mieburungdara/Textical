/**
 * StunStatus
 * Action denial effect - unit cannot take actions while stunned.
 */
const BaseStatus = require('./BaseStatus');
const { StatModifierType } = require('../statSystem');

class StunStatus extends BaseStatus {
    constructor(duration = 1, power = 0) {
        super("STUN", duration, power, {
            priority: 100, // High priority - processes first
            stackable: false,
            canDispel: true,
            isBuff: false,
            statModifiers: [
                { statKey: "speed", value: -0.5, type: StatModifierType.PERCENT },
                { statKey: "accuracy", value: -25, type: StatModifierType.FLAT }
            ]
        });
    }

    _onApplyCustom(unit, sim) {
        // Stun visual effect
        if (sim && sim.logger) {
            sim.logger.addEvent("STATUS_APPLIED", `${unit.data.name} is stunned!`, {
                target_id: unit.instanceId,
                status_type: "STUN",
                duration: this.duration
            });
        }
    }

    _onTickCustom(unit, sim) {
        // Check if unit can act - stun prevents action
        // This is handled in battleUnit.isReady() check
    }

    _onExpireCustom(unit, sim) {
        if (sim && sim.logger) {
            sim.logger.addEvent("STATUS_EXPIRED", `${unit.data.name} is no longer stunned`, {
                target_id: unit.instanceId,
                status_type: "STUN"
            });
        }
    }

    getDescription(unit) {
        return `Stun: ${this.duration} turns, cannot take actions`;
    }
}

module.exports = StunStatus;
