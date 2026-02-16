/**
 * BaseStatus (v2.0 - Enhanced Status System)
 * The blueprint for all Buffs and Debuffs.
 * Supports stat modifiers, conditional effects, and priority system.
 */
const { StatModifier, StatModifierType } = require('../statSystem');

class BaseStatus {
    /**
     * @param {string} type - Status type identifier (e.g., "BURN", "STUN")
     * @param {number} duration - Duration in turns/ticks
     * @param {number} power - Power/strength of the effect
     * @param {Object} options - Additional options
     */
    constructor(type, duration, power = 0, options = {}) {
        this.type = type.toUpperCase();
        this.duration = duration;
        this.maxDuration = duration;
        this.power = power;
        this.priority = options.priority || 0; // Higher priority processes first
        this.stackable = options.stackable || false;
        this.stackCount = 1;
        this.maxStacks = options.maxStacks || 1;
        
        // Stat modifiers
        this.statModifiers = options.statModifiers || [];
        
        // Conditional effect settings
        this.conditionType = options.conditionType || null; // e.g., "FIRE_ONLY", "NOT_FIRE"
        this.conditionTarget = options.conditionTarget || null; // e.g., "enemy_type"
        
        // Status flags
        this.isBuff = options.isBuff || false;
        this.canDispel = options.canDispel !== false;
        
        // Tracking
        this.appliedAt = null;
        this.source = options.source || null;
    }

    /**
     * Called when status is applied to a unit
     */
    onApply(unit, sim) {
        this.appliedAtTick = sim.currentTick;
        
        // Apply stat modifiers
        if (this.statModifiers.length > 0) {
            this._applyStatModifiers(unit);
        }
        
        // Execute custom onApply logic
        this._onApplyCustom(unit, sim);
    }

    /**
     * Called each tick/turn while status is active
     */
    onTick(unit, sim) {
        // Check if condition is still met
        if (!this._checkCondition(unit)) {
            this.duration = 0; // Expire if condition no longer met
            return;
        }
        
        // Execute custom tick logic
        this._onTickCustom(unit, sim);
    }

    /**
     * Called when status expires or is removed
     */
    onExpire(unit, sim) {
        // Remove stat modifiers
        this._removeStatModifiers(unit);
        
        // Execute custom expire logic
        this._onExpireCustom(unit, sim);
    }

    /**
     * Check if status should affect this unit (conditional effects)
     */
    _checkCondition(unit) {
        if (!this.conditionType) return true;
        
        switch (this.conditionType) {
            case "FIRE_ONLY":
                return unit.elementalAffinity === "FIRE";
            case "NOT_FIRE":
                return unit.elementalAffinity !== "FIRE";
            case "HUMAN_ONLY":
                return unit.race === "human";
            case "UNDEAD_ONLY":
                return unit.race === "undead";
            case "BEAST_ONLY":
                return unit.race === "beast";
            case "LOW_HP":
                return unit.currentHealth < (unit.getStat("health_max") * 0.3);
            case "FULL_HP":
                return unit.currentHealth >= unit.getStat("health_max");
            default:
                return true;
        }
    }

    /**
     * Apply stat modifiers to unit
     */
    _applyStatModifiers(unit) {
        if (!unit._statusModifiers) {
            unit._statusModifiers = new Map();
        }
        
        this.statModifiers.forEach(mod => {
            const statKey = mod.statKey;
            const modifier = new StatModifier({
                value: mod.value,
                type: mod.type || StatModifierType.PERCENT,
                source: `Status:${this.type}`,
                priority: this.priority + 10 // Status modifiers have high priority
            });
            
            if (!unit._statusModifiers.has(statKey)) {
                unit._statusModifiers.set(statKey, []);
            }
            unit._statusModifiers.get(statKey).push(modifier);
            
            // Apply to temporaryStats for immediate effect
            if (unit.temporaryStats) {
                const currentMod = unit.temporaryStats[statKey] || 0;
                unit.temporaryStats[statKey] = currentMod + (mod.type === StatModifierType.PERCENT ? 
                    (unit.getStat(statKey) * mod.value) : mod.value);
            }
        });
    }

    /**
     * Remove stat modifiers from unit
     */
    _removeStatModifiers(unit) {
        if (!unit._statusModifiers) return;
        
        this.statModifiers.forEach(mod => {
            const statKey = mod.statKey;
            const modifiers = unit._statusModifiers.get(statKey) || [];
            const idx = modifiers.findIndex(m => m.source === `Status:${this.type}`);
            if (idx !== -1) {
                modifiers.splice(idx, 1);
            }
        });
    }

    // Override these in subclasses
    _onApplyCustom(unit, sim) {}
    _onTickCustom(unit, sim) {}
    _onExpireCustom(unit, sim) {}

    /**
     * Stack this status with existing one
     */
    stackWith(existing) {
        if (!this.stackable || !existing.stackable) return false;
        
        if (existing.stackCount < existing.maxStacks) {
            existing.stackCount++;
            existing.power = Math.max(existing.power, this.power);
            existing.duration = Math.max(existing.duration, this.duration);
            return true;
        }
        return false;
    }

    /**
     * Get status description for UI
     */
    getDescription(unit) {
        return `${this.type}: ${this.duration} turns, Power: ${this.power}`;
    }
}

module.exports = BaseStatus;
