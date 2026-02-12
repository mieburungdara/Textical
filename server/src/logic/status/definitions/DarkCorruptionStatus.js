const BaseStatus = require('../BaseStatus');
const { StatModifierType } = require('../statSystem');

/**
 * DarkCorruptionStatus - DARK element stacking debuff
 * 
 * Mechanics:
 * - Each stack reduces defense by 5%
 * - Maximum 5 stacks
 * - Stacks refresh duration
 * - Can only be applied by DARK element skills
 */
class DarkCorruptionStatus extends BaseStatus {
    constructor(duration = 4, power = 0) {
        super('DARK_CORRUPTION', duration, power, {
            priority: 1,  // Low priority (stackable debuff)
            stackable: true,
            maxStacks: 5,
            isBuff: false,
            canDispel: true
        });
    }

    _onApplyCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} is corrupted by darkness! (${this.stackCount} stacks, -${this.getDefenseReduction()}% DEF)`, {
            target_id: unit.instanceId,
            status: "DARK_CORRUPTION",
            stacks: this.stackCount
        });
    }

    _onTickCustom(unit, sim) {
        // No per-tick effect, only stat reduction
    }

    _onExpireCustom(unit, sim) {
        sim.logger.addEvent("STATUS", `${unit.data.name} recovers from Dark Corruption.`, {
            target_id: unit.instanceId
        });
    }

    /**
     * Get defense reduction based on current stack count
     */
    getDefenseReduction() {
        return 5 * this.stackCount;  // 5% per stack, max 25%
    }

    /**
     * Stack with existing Dark Corruption
     */
    stackWith(existing) {
        if (!this.stackable || !existing.stackable) return false;
        
        if (existing.stackCount < existing.maxStacks) {
            existing.stackCount++;
            existing.duration = Math.max(existing.duration, this.duration);
            
            // Update stat modifiers based on new stack count
            existing._updateStatModifiers();
            
            return true;
        }
        return false;
    }

    /**
     * Update stat modifiers based on stack count
     */
    _updateStatModifiers() {
        const defenseReduction = -0.05 * this.stackCount;
        
        // Clear and re-apply stat modifiers
        this.statModifiers = [
            { statKey: "defense_mult", value: defenseReduction, type: StatModifierType.PERCENT }
        ];
    }

    /**
     * Check if this status should affect a unit
     * TICK-BASED: Duration is already in turns/ticks, no real-time conversion needed
     */
    _checkCondition(unit) {
        if (unit.elementalAffinity === 'light') {
            // Light units get 50% reduced stacks (tick-based calculation)
            return this.duration > 0 && this.stackCount > 0.5;
        }
        return this.duration > 0;
    }
}

module.exports = DarkCorruptionStatus;
