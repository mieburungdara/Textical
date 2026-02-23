/**
 * WetStatus
 * Water weakness effect - increases water damage taken, reduces fire damage.
 */
const BaseStatus = require('./BaseStatus');
const { StatModifierType } = require('../statSystem');

class WetStatus extends BaseStatus {
    constructor(duration = 3, power = 0.25) {
        super("WET", duration, power, {
            priority: 20,
            stackable: true,
            maxStacks: 3,
            canDispel: true,
            isBuff: false,
            statModifiers: [
                { statKey: "water_resistance", value: -power, type: StatModifierType.PERCENT },
                { statKey: "fire_damage", value: -power * 50, type: StatModifierType.FLAT },
                { statKey: "speed", value: power * 0.1, type: StatModifierType.PERCENT } // Slightly faster (slippery)
            ]
        });
        
        this.waterVulnerability = power; // 25% extra water damage
        this.fireWeakness = power; // 25% less fire damage
    }

    _onTickCustom(unit, sim) {
        // Wet status has ongoing effects
    }

    _onExpireCustom(unit, sim) {
        // Dry off effect
    }

    getDescription(unit) {
        return `Wet: ${this.duration} turns, +${this.waterVulnerability * 100}% water damage taken`;
    }
}

module.exports = WetStatus;
