/**
 * DARK Element System Test Script
 * Validates the implementation of DARK element with LIGHT opposition
 */

const CombatRules = require('./src/logic/combatRules');
const ElementalResolver = require('./src/services/stat/ElementalResolver');
const fs = require('fs');
const path = require('path');

console.log("=".repeat(60));
console.log("DARK ELEMENT SYSTEM VALIDATION TEST");
console.log("=".repeat(60));

// Test 1: Element Enums
console.log("\n[TEST 1] Element Enums Verification");
console.log("-".repeat(40));

const elements = CombatRules.ELEMENTS;
console.log("CombatRules.ELEMENTS:");
Object.entries(elements).forEach(([name, value]) => {
    console.log(`  ${name}: ${value}`);
});

console.log("\nElementalResolver.Element:");
Object.entries(ElementalResolver.Element).forEach(([name, value]) => {
    console.log(`  ${name}: ${value}`);
});

// Test 2: Elemental Effectiveness Matrix
console.log("\n[TEST 2] Elemental Effectiveness Matrix");
console.log("-".repeat(40));

const LIGHT = CombatRules.ELEMENTS.LIGHT;
const DARK = CombatRules.ELEMENTS.DARK;
const FIRE = CombatRules.ELEMENTS.FIRE;
const WATER = CombatRules.ELEMENTS.WATER;

console.log("Key Relationships:");
console.log(`  DARK (${DARK}) vs LIGHT (${LIGHT}): ${CombatRules.ELEMENTAL_EFFECTIVENESS[DARK][LIGHT]}x`);
console.log(`  LIGHT (${LIGHT}) vs DARK (${DARK}): ${CombatRules.ELEMENTAL_EFFECTIVENESS[LIGHT][DARK]}x`);
console.log(`  FIRE (${FIRE}) vs NATURE (${CombatRules.ELEMENTS.NATURE}): ${CombatRules.ELEMENTAL_EFFECTIVENESS[FIRE][CombatRules.ELEMENTS.NATURE]}x`);
console.log(`  WATER (${WATER}) vs FIRE (${FIRE}): ${CombatRules.ELEMENTAL_EFFECTIVENESS[WATER][FIRE]}x`);

// Test 3: Environmental Modifiers
console.log("\n[TEST 3] Environmental Modifiers (Day/Night)");
console.log("-".repeat(40));

console.log("CombatRules.ENVIRONMENTAL_MODIFIERS:");
console.log(`  DAY: LIGHT=${CombatRules.ENVIRONMENTAL_MODIFIERS.DAY.LIGHT}, DARK=${CombatRules.ENVIRONMENTAL_MODIFIERS.DAY.DARK}`);
console.log(`  NIGHT: LIGHT=${CombatRules.ENVIRONMENTAL_MODIFIERS.NIGHT.LIGHT}, DARK=${CombatRules.ENVIRONMENTAL_MODIFIERS.NIGHT.DARK}`);
console.log(`  DAWN: LIGHT=${CombatRules.ENVIRONMENTAL_MODIFIERS.DAWN.LIGHT}, DARK=${CombatRules.ENVIRONMENTAL_MODIFIERS.DAWN.DARK}`);
console.log(`  DUSK: LIGHT=${CombatRules.ENVIRONMENTAL_MODIFIERS.DUSK.LIGHT}, DARK=${CombatRules.ENVIRONMENTAL_MODIFIERS.DUSK.DARK}`);

// Test 4: Type Bonuses
console.log("\n[TEST 4] Type Bonuses (vs Undead/Demon)");
console.log("-".repeat(40));

console.log("CombatRules.TYPE_BONUSES:");
console.log(`  LIGHT vs UNDEAD: ${CombatRules.TYPE_BONUSES.LIGHT.UNDEAD}x`);
console.log(`  LIGHT vs DEMON: ${CombatRules.TYPE_BONUSES.LIGHT.DEMON}x`);
console.log(`  DARK vs UNDEAD: ${CombatRules.TYPE_BONUSES.DARK.UNDEAD}x`);
console.log(`  DARK vs DEMON: ${CombatRules.TYPE_BONUSES.DARK.DEMON}x`);

// Test 5: Interaction Relationships
console.log("\n[TEST 5] ElementalResolver.INTERACTIONS");
console.log("-".repeat(40));

console.log("DARK interactions:");
console.log(`  Weak against: ${ElementalResolver.INTERACTIONS.dark.weakAgainst}`);
console.log(`  Strong against: ${ElementalResolver.INTERACTIONS.dark.strongAgainst}`);
console.log(`  Is DoT element: ${ElementalResolver.INTERACTIONS.dark.isDoTElement}`);
console.log(`  Debuff bonus: +${(ElementalResolver.INTERACTIONS.dark.debuffBonus * 100)}%`);

console.log("\nLIGHT interactions:");
console.log(`  Weak against: ${ElementalResolver.INTERACTIONS.light.weakAgainst}`);
console.log(`  Strong against: ${ElementalResolver.INTERACTIONS.light.strongAgainst || 'none (utility-focused)'}`);
console.log(`  Type bonus vs Undead: ${ElementalResolver.INTERACTIONS.light.typeBonus?.undead}x`);
console.log(`  Type bonus vs Demon: ${ElementalResolver.INTERACTIONS.light.typeBonus?.demon}x`);

// Test 6: Status Effects
console.log("\n[TEST 6] DARK/LIGHT Status Effects");
console.log("-".repeat(40));

const statusEffects = [
    'ShadowAffliction',  // No Status suffix
    'FearStatus',
    'DarkCorruptionStatus',
    'PurificationStatus',
    'SanctuaryStatus'
];

statusEffects.forEach(effect => {
    const filePath = path.join(__dirname, `src/logic/status/definitions/${effect}.js`);
    if (fs.existsSync(filePath)) {
        console.log(`  ✓ ${effect}.js - EXISTS`);
    } else {
        console.log(`  ✗ ${effect}.js - MISSING`);
    }
});

// Test 7: Element Colors
console.log("\n[TEST 7] Element Colors for UI");
console.log("-".repeat(40));

console.log("ElementalResolver.ElementColor:");
Object.entries(ElementalResolver.ElementColor).forEach(([element, color]) => {
    console.log(`  ${element}: ${color}`);
});

// Summary
console.log("\n" + "=".repeat(60));
console.log("TEST SUMMARY");
console.log("=".repeat(60));

const results = {
    elementsDefined: Object.keys(CombatRules.ELEMENTS).length === 8,
    darkVsLightCorrect: CombatRules.ELEMENTAL_EFFECTIVENESS[DARK][LIGHT] === 1.5 && 
                        CombatRules.ELEMENTAL_EFFECTIVENESS[LIGHT][DARK] === 1.0,
    envModifiersExist: !!CombatRules.ENVIRONMENTAL_MODIFIERS,
    typeBonusesExist: !!CombatRules.TYPE_BONUSES,
    interactionsDefined: !!ElementalResolver.INTERACTIONS.dark && !!ElementalResolver.INTERACTIONS.light,
    statusEffectsCreated: statusEffects.every(effect => {
        const filePath = path.join(__dirname, `src/logic/status/definitions/${effect}.js`);
        return fs.existsSync(filePath);
    })
};

Object.entries(results).forEach(([test, passed]) => {
    console.log(`  ${passed ? '✓' : '✗'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
});

const allPassed = Object.values(results).every(r => r);
console.log(`\n${allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'}`);
console.log("=".repeat(60));

module.exports = { results };
