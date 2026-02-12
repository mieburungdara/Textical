const BaseStatus = require('../BaseStatus');
const { StatModifierType } = require('../statSystem');

/**
 * PurificationStatus - LIGHT element buff that removes DARK debuffs
 * 
 * Mechanics:
 * - Removes all DARK-related status effects on application
 * - Grants immunity to DARK debuffs for duration
 * - Provides bonus healing received
 */
class PurificationStatus extends BaseStatus {
    constructor(duration = 3, power = 0) {
        super('PURIFICATION', duration, power, {
            priority: 10,  // Very high priority (cleansing effect)
            stackable: false,
            maxStacks: 1,
            isBuff: true,
            canDispel: false,  // Cannot be dispelled (important buff)
            statModifiers: [
                { statKey: "dark_resistance", value: 0.50, type: StatModifierType.PERCENT },  // +50% dark resistance
                { statKey: "healing_received_mult", value: 0.25, type: StatModifierType.PERCENT }  // +25% healing received
            ]
        });
    }

    _onApplyCustom(unit, sim) {
        // Remove all DARK-related debuffs
        const darkDebuffs = ['SHADOW_AFFLICTION', 'FEAR', 'DARK_CORRUPTION'];
        let removedCount = 0;
        
        if (unit.statusEffects) {
            darkDebuffs.forEach(debuffType => {
                const index = unit.statusEffects.findIndex(e => e.type === debuffType);
                if (index !== -1) {
                    unit.statusEffects.splice(index, 1);
                    removedCount++;
                }
            });
        }

        sim.logger.addEvent("STATUS", `${unit.data.name} is purified! (+50% Dark RES, +25% Healing, removed ${removedCount} debuffs)`, {
            target_id: unit.instanceId,
            status: "PURIFICATION",
            duration: this.duration,
            debuffs_removed: removedCount
        });
    }

    _onTickCustom(unit, sim) {
        // No per-tick effect, just passive bonuses
    }

    _onExpireCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name}'s Purification fades.`, {
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

module.exports = PurificationStatus;
