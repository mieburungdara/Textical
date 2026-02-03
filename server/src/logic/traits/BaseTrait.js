/**
 * BaseTrait (v3.1 - AAA Tactical Standard with Stat Integration)
 * Total Granularity for high-end RPG mechanics.
 * Supports stat modifiers, conditional effects, and stat bonuses.
 */
const { StatModifier, StatModifierType, ConditionType } = require('../statSystem');

class BaseTrait {
    constructor(name) { 
        this.name = name.toLowerCase();
        this._statModifiers = [];
        this._statBonuses = {};
        this._conditions = [];
    }

    // --- 1. STAT MODIFIER HOOKS ---
    /**
     * Get stat modifiers provided by this trait
     * @returns {Array<{statKey: string, value: number, type: StatModifierType, condition?: string}>}
     */
    getStatModifiers() {
        return this._statModifiers;
    }

    /**
     * Add a stat modifier to this trait
     */
    addStatModifier(statKey, value, type = StatModifierType.FLAT, condition = null) {
        this._statModifiers.push({ statKey, value, type, condition });
    }

    /**
     * Get stat bonuses (flat bonuses to base stats)
     * @returns {Object} { str: 5, dex: 3, etc. }
     */
    getStatBonuses() {
        return this._statBonuses;
    }

    /**
     * Set a stat bonus
     */
    setStatBonus(statKey, value) {
        this._statBonuses[statKey] = value;
    }

    /**
     * Check if trait conditions are met
     */
    checkConditions(context) {
        for (const condition of this._conditions) {
            if (!this._evaluateCondition(condition, context)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Add a condition for this trait to be active
     */
    addCondition(condition) {
        this._conditions.push(condition);
    }

    _evaluateCondition(condition, context) {
        switch (condition.type) {
            case ConditionType.ENEMY_TYPE:
                return context.targetType === condition.value;
            case ConditionType.SELF_HP_BELOW:
                return context.selfHpPercent < condition.value;
            case ConditionType.SELF_HP_ABOVE:
                return context.selfHpPercent > condition.value;
            case ConditionType.ENEMY_HP_BELOW:
                return context.targetHpPercent < condition.value;
            case ConditionType.IN_COMBAT:
                return context.inCombat === true;
            case ConditionType.HAS_STATUS:
                return context.hasStatus?.includes(condition.value);
            case ConditionType.NO_STATUS:
                return !context.hasStatus?.includes(condition.value);
            default:
                return true;
        }
    }

    // --- 2. GLOBAL & ROUND LIFECYCLE ---
    onBattleStart(unit, sim) {}
    onRoundStart(unit, sim) {} // Triggers every 100 total simulation ticks
    onRoundEnd(unit, sim) {}
    onBattleEnd(unit, sim) {}

    // --- 3. UNIT TURN PHASES ---
    onTurnStart(unit, sim) {} // Exactly when unit hits 100 AP
    onPreAction(unit, sim) { return true; } // Chance to skip/override action
    onPostAction(unit, sim) {} // After skill/attack finishes
    onTurnEnd(unit, sim) {} // Before AP is deducted

    // --- 4. MOVEMENT & GRID SENSING ---
    onBeforeMove(unit, sim) { return true; }
    onTileExit(unit, fromPos, sim) {}
    onTileEnter(unit, toPos, sim) {} 
    onMoveStep(unit, nextPos, sim) {} // Called for every single tile walked
    onMoveEnd(unit, sim) {}
    onObstacleImpact(unit, obstacle, sim) {} // Triggers when knocked into wall/unit
    onAdjacencyGained(unit, neighbor, sim) {} // When an ally/enemy moves next to unit
    onAdjacencyLost(unit, neighbor, sim) {}

    // --- 5. COMBAT INITIATION (Attacker Perspective) ---
    onPreAttack(attacker, target, sim) { return {}; } // Modify stats before roll
    onAttackMissed(attacker, target, sim) {}
    onCrit(attacker, target, damage, sim) {}
    onPostAttack(attacker, target, damage, sim) {}
    onKill(attacker, victim, sim) {}
    onLifesteal(attacker, damage, sim) {}

    // --- 6. COMBAT REACTION (Defender Perspective) ---
    onPreDefend(defender, attacker, sim) { return {}; } // Modify DEF/Dodge before hit
    onDodge(defender, attacker, sim) {}
    onBlock(defender, attacker, sim) {}
    onTakeDamage(defender, attacker, amount, sim) { return {}; } // Final mitigation/reflect
    onPostHit(defender, attacker, damage, sim) {} // After damage is applied

    // --- 7. STATUS & BUFF ENGINE ---
    onStatusApplied(unit, effect, sim) { return true; } // Return false to resist
    onStatusTick(unit, effect, sim) {} // Triggers on every DoT tick
    onStatusExpired(unit, effect, sim) {}
    onStatusPurged(unit, effect, sim) {}

    // --- 8. RESOURCE & VITALITY ---
    onActionPointsChange(unit, oldVal, newVal, sim) {}
    onManaGain(unit, amount, sim) {}
    onManaSpend(unit, amount, sim) {}
    onHealthRegen(unit, amount, sim) {}
    onBeforeDeath(unit, sim) { return false; } // Return true to survive at 1 HP
    onDeath(unit, sim) {}

    // --- 9. TEAM SYNERGY (Reactive) ---
    onAllyDamage(unit, ally, amount, sim) {} // Guardian/Protector logic
    onAllyKill(unit, ally, victim, sim) {} // Morale boost logic
    onAllyDeath(unit, ally, sim) {} // Vengeance logic

    // --- 10. COMBAT CALCULATION HOOKS ---
    onCalculateHitChance(attacker, defender) { return {}; }
    onCalculateDodgeChance(defender, attacker) { return {}; }
    onCalculateCrit(attacker, defender) { return {}; }
    onCalculateBlock(defender, attacker) { return {}; }
    onDirectionalBonus(attacker, bonuses, position) { return {}; }
}

module.exports = BaseTrait;
