const BaseStatus = require('../BaseStatus');
const { StatModifierType } = require('../statSystem');

/**
 * SanctuaryStatus - LIGHT element area buff that provides dark resistance
 * 
 * Mechanics:
 * - Grants +30% dark resistance to the target
 * - Provides +10% bonus healing received
 * - Creates a protective barrier against dark attacks
 * - Cannot be dispelled
 */
class SanctuaryStatus extends BaseStatus {
    constructor(duration = 4, power = 0) {
        super('SANCTUARY', duration, power, {
            priority: 8,  // High priority protective buff
            stackable: false,  // Sanctuary doesn't stack
            maxStacks: 1,
            isBuff: true,
            canDispel: false,  // Cannot be dispelled (protective effect)
            statModifiers: [
                { statKey: "dark_resistance", value: 0.30, type: StatModifierType.PERCENT },  // +30% dark resistance
                { statKey: "healing_received_mult", value: 0.10, type: StatModifierType.PERCENT }  // +10% healing received
            ]
        });
    }

    _onApplyCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} is protected by Sanctuary! (+30% Dark RES, +10% Healing)`, {
            target_id: unit.instanceId,
            status: "SANCTUARY",
            duration: this.duration
        });
    }

    _onTickCustom(unit, sim) {
        // Check if unit is affected by DARK attacks this turn, reduce damage
        if (unit.lastDamageType === 'dark' || unit.lastDamageElement === 'dark') {
            sim.logger.addEvent("BLOCK", `Sanctuary blocks dark energy from ${unit.data.name}`, {
                target_id: unit.instanceId,
                blocked: true
            });
        }
    }

    _onExpireCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name}'s Sanctuary fades.`, {
            target_id: unit.instanceId
        });
    }

    /**
     * Override to prevent dispelling
     */
    canBeDispeled() {
        return false;
    }

    /**
     * Check if this status should affect a unit
     * TICK-BASED: Duration is already in turns/ticks, no real-time conversion needed
     */
    _checkCondition(unit) {
        return this.duration > 0;
    }
}

module.exports = SanctuaryStatus;
