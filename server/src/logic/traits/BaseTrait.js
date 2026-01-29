/**
 * BaseTrait (v3.0 - AAA Tactical Standard)
 * Total Granularity for high-end RPG mechanics.
 */
class BaseTrait {
    constructor(name) { this.name = name.toLowerCase(); }

    // --- 1. GLOBAL & ROUND LIFECYCLE ---
    onBattleStart(unit, sim) {}
    onRoundStart(unit, sim) {} // Triggers every 100 total simulation ticks
    onRoundEnd(unit, sim) {}
    onBattleEnd(unit, sim) {}

    // --- 2. UNIT TURN PHASES ---
    onTurnStart(unit, sim) {} // Exactly when unit hits 100 AP
    onPreAction(unit, sim) { return true; } // Chance to skip/override action
    onPostAction(unit, sim) {} // After skill/attack finishes
    onTurnEnd(unit, sim) {} // Before AP is deducted

    // --- 3. MOVEMENT & GRID SENSING ---
    onBeforeMove(unit, sim) { return true; }
    onTileExit(unit, fromPos, sim) {}
    onTileEnter(unit, toPos, sim) {} 
    onMoveStep(unit, nextPos, sim) {} // Called for every single tile walked
    onMoveEnd(unit, sim) {}
    onAdjacencyGained(unit, neighbor, sim) {} // When an ally/enemy moves next to unit
    onAdjacencyLost(unit, neighbor, sim) {}

    // --- 4. COMBAT INITIATION (Attacker Perspective) ---
    onPreAttack(attacker, target, sim) { return {}; } // Modify stats before roll
    onAttackMissed(attacker, target, sim) {}
    onCrit(attacker, target, damage, sim) {}
    onPostAttack(attacker, target, damage, sim) {}
    onKill(attacker, victim, sim) {}
    onLifesteal(attacker, damage, sim) {}

    // --- 5. COMBAT REACTION (Defender Perspective) ---
    onPreDefend(defender, attacker, sim) { return {}; } // Modify DEF/Dodge before hit
    onDodge(defender, attacker, sim) {}
    onBlock(defender, attacker, sim) {}
    onTakeDamage(defender, attacker, amount, sim) { return {}; } // Final mitigation/reflect
    onPostHit(defender, attacker, damage, sim) {} // After damage is applied

    // --- 6. STATUS & BUFF ENGINE ---
    onStatusApplied(unit, effect, sim) { return true; } // Return false to resist
    onStatusTick(unit, effect, sim) {} // Triggers on every DoT tick
    onStatusExpired(unit, effect, sim) {}
    onStatusPurged(unit, effect, sim) {}

    // --- 7. RESOURCE & VITALITY ---
    onActionPointsChange(unit, oldVal, newVal, sim) {}
    onManaGain(unit, amount, sim) {}
    onManaSpend(unit, amount, sim) {}
    onHealthRegen(unit, amount, sim) {}
    onBeforeDeath(unit, sim) { return false; } // Return true to survive at 1 HP
    onDeath(unit, sim) {}

    // --- 8. TEAM SYNERGY (Reactive) ---
    onAllyDamage(unit, ally, amount, sim) {} // Guardian/Protector logic
    onAllyKill(unit, ally, victim, sim) {} // Morale boost logic
    onAllyDeath(unit, ally, sim) {} // Vengeance logic
}

module.exports = BaseTrait;
