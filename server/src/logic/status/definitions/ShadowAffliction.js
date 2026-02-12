const BaseStatus = require('../BaseStatus');

/**
 * ShadowAfflictionStatus - DARK element DoT that reduces healing received
 * 
 * Mechanics:
 * - Deals dark damage over time
 * - Reduces healing received by 25%
 * - Stackable up to 3 times
 */
class ShadowAfflictionStatus extends BaseStatus {
    constructor(duration = 3, power = 5) {
        super('SHADOW_AFFLICTION', duration, power, {
            priority: 2,  // Medium priority
            stackable: true,
            maxStacks: 3,
            isBuff: false,
            canDispel: true
        });
    }

    _onApplyCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} is afflicted by shadow! (-25% healing received)`, {
            target_id: unit.instanceId,
            status: "SHADOW_AFFLICTION",
            stacks: this.stackCount
        });
    }

    _onTickCustom(unit, sim) {
        const damagePerStack = this.power * this.stackCount;
        unit.takeDamage(damagePerStack);
        
        sim.logger.addEvent("DAMAGE", `${unit.data.name} suffers from Shadow Affliction`, {
            target_id: unit.instanceId,
            damage: damagePerStack,
            type: "SHADOW_AFFLICTION",
            stacks: this.stackCount
        });
    }

    _onExpireCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} recovers from Shadow Affliction.`, {
            target_id: unit.instanceId
        });
    }

    /**
     * Get healing reduction percentage based on stack count
     */
    getHealingReduction() {
        return 0.25 * this.stackCount;
    }

    /**
     * Check if this status should affect a unit (conditional effect)
     * TICK-BASED: Duration is already in turns/ticks, no real-time conversion needed
     */
    _checkCondition(unit) {
        // Shadow Affliction affects all units, but LIGHT units have reduced duration
        if (unit.elementalAffinity === 'light') {
            // LIGHT units get 50% reduced effective duration (tick-based calculation)
            return this.duration > Math.ceil(this.maxDuration * 0.5);
        }
        return this.duration > 0;
    }
}

module.exports = ShadowAfflictionStatus;
