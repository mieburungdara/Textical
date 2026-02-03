/**
 * LeadenStatus
 * Speed reduction effect - unit moves and acts slower.
 */
const BaseStatus = require('./BaseStatus');
const { StatModifierType } = require('../statSystem');

class LeadenStatus extends BaseStatus {
    constructor(duration = 3, power = 0.3) {
        super("LEADEN", duration, power, {
            priority: 30,
            stackable: true,
            maxStacks: 5,
            canDispel: true,
            isBuff: false,
            statModifiers: [
                { statKey: "speed", value: -power, type: StatModifierType.PERCENT },
                { statKey: "initiative", value: -power * 10, type: StatModifierType.FLAT }
            ]
        });
    }

    _onTickCustom(unit, sim) {
        // Leaden just reduces speed - no per-tick action needed
    }

    _onExpireCustom(unit, sim) {
        // Speed returns to normal automatically via stat modifier removal
    }

    getDescription(unit) {
        return `Leaden: ${this.duration} turns, ${this.power * 100}% speed reduction`;
    }
}

module.exports = LeadenStatus;
