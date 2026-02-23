const BaseStatus = require('../BaseStatus');
const { StatModifierType } = require('../statSystem');

/**
 * FearStatus - DARK element debuff that reduces attack and accuracy
 * 
 * Mechanics:
 * - Reduces attack damage by 15%
 * - Reduces accuracy by 10%
 * - Has diminishing returns on repeat applications
 */
class FearStatus extends BaseStatus {
    constructor(duration = 3, power = 0) {
        super('FEAR', duration, power, {
            priority: 3,  // High priority (strong debuff)
            stackable: false,  // Fear doesn't stack, just refreshes
            maxStacks: 1,
            isBuff: false,
            canDispel: true,
            statModifiers: [
                { statKey: "attack_damage_mult", value: -0.15, type: StatModifierType.PERCENT },
                { statKey: "accuracy", value: -0.10, type: StatModifierType.PERCENT }
            ]
        });
    }

    _onApplyCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} is consumed by fear! (-15% ATK, -10% ACC)`, {
            target_id: unit.instanceId,
            status: "FEAR",
            duration: this.duration
        });
    }

    _onExpireCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} recovers from Fear.`, {
            target_id: unit.instanceId
        });
    }

    /**
     * Fear prevents the unit from taking aggressive actions
     * This is checked in the action system before allowing attacks
     */
    preventsAggressiveAction() {
        return true;
    }

    /**
     * Check if this status should affect a unit
     * TICK-BASED: Duration is already in turns/ticks, no real-time conversion needed
     */
    _checkCondition(unit) {
        if (unit.elementalAffinity === 'light') {
            // LIGHT units get 50% reduced effective duration (tick-based calculation)
            return this.duration > Math.ceil(this.maxDuration * 0.5);
        }
        return this.duration > 0;
    }
}

module.exports = FearStatus;
