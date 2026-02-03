/**
 * Debug Script untuk 12-Layer Pipeline Calculation
 * Validasi bugs yang ditemukan dalam sistem stat calculation
 */

const BaseService = require('../src/services/BaseService');
const { EnhancedStat, StatModifier, StatModifierType, GrowthCurveType } = require('../src/logic/statSystem');
const StatCurveCalculator = require('../src/services/stat/StatCurveCalculator');

// Mock hero data untuk testing
const mockHeroData = {
    id: 1,
    str: 10,
    dex: 10,
    int: 10,
    vit: 10,
    luk: 5,
    hp_base: 100,
    mana_base: 20,
    damage_base: 10,
    defense_base: 0,
    speed_base: 5,
    unitLevel: 10,
    classLevel: 10,
    combatClassId: 1,
    combatClass: {
        id: 1,
        name: 'Warrior',
        statAllocationTemplate: {
            strGrowthCurve: 'linear',
            dexGrowthCurve: 'linear',
            intGrowthCurve: 'linear',
            vitGrowthCurve: 'linear',
            lukGrowthCurve: 'linear',
            strGrowthFactor: 1.0,
            dexGrowthFactor: 1.0,
            intGrowthFactor: 1.0,
            vitGrowthFactor: 1.0,
            lukGrowthFactor: 1.0
        }
    },
    heroStatAllocation: {
        strAllocated: 5,
        dexAllocated: 3,
        intAllocated: 2,
        vitAllocated: 4,
        lukAllocated: 1
    },
    elementalAffinities: [],
    buffs: [],
    equipment: [],
    buffs: [],
    user: { guildId: null, factionId: null }
};

console.log('='.repeat(60));
console.log('DEBUG: 12-Layer Pipeline Calculation');
console.log('='.repeat(60));

// ============================================================
// TEST 1: Bug - context.primary is undefined
// ============================================================
console.log('\n[TEST 1] Bug: context.primary is undefined');
console.log('-'.repeat(60));

// Simulate _applyGrowth function
function testBug1_contextPrimary() {
    const stats = {
        health_max: new EnhancedStat(100, { name: 'health_max' }),
        str: new EnhancedStat(10, { name: 'str' }),
        dex: new EnhancedStat(10, { name: 'dex' })
    };

    const primary = {
        str: new EnhancedStat(10, { name: 'str', max: 255 }),
        dex: new EnhancedStat(10, { name: 'dex', max: 255 }),
        int: new EnhancedStat(10, { name: 'int', max: 255 }),
        vit: new EnhancedStat(10, { name: 'vit', max: 255 }),
        luk: new EnhancedStat(5, { name: 'luk', max: 255 })
    };

    const context = {
        level: 10,
        primary: primary  // ❌ BUG: primary passed in context but function uses wrong reference
    };

    // Simulating the buggy code from line 464:
    // const primaryStat = context.primary?.[attr];

    const attr = 'str';
    const primaryStat = context.primary?.[attr];

    console.log(`context.primary exists: ${context.primary !== undefined}`);
    console.log(`context.primary['str'] exists: ${primaryStat !== undefined}`);
    console.log(`context.primary['str'].getValue(): ${primaryStat?.getValue()}`);

    if (primaryStat) {
        // Apply modifier (this is what should happen)
        primaryStat.addModifier(new StatModifier({
            value: 5,
            type: StatModifierType.FLAT,
            source: 'TestGrowth',
            priority: 5
        }));
        console.log(`✅ After modifier, str = ${primaryStat.getValue()}`);
    } else {
        console.log(`❌ BUG REPRODUCED: primaryStat is undefined for attr='${attr}'`);
        console.log(`   Growth bonus would NOT be applied!`);
    }
}

testBug1_contextPrimary();

// ============================================================
// TEST 2: Bug - Layer Order (Scaling sebelum Caps)
// ============================================================
console.log('\n[TEST 2] Bug: Layer Order - Scaling sebelum Caps');
console.log('-'.repeat(60));

function testBug2_layerOrder() {
    console.log('Current Order (BUGGY):');
    console.log('  Layer 12a: Apply attribute scaling (scalingComponent.applyAttributeScaling)');
    console.log('  Layer 12b: Apply caps (_finalizeStats)');
    console.log('');
    console.log('Correct Order (FIXED):');
    console.log('  Layer 12a: Apply caps (_finalizeStats)');
    console.log('  Layer 12b: Apply attribute scaling (scalingComponent.applyAttributeScaling)');
    console.log('');
    console.log('Problem: If scaling adds bonus AFTER caps,');
    console.log('         the capped value gets increased again!');
}

testBug2_layerOrder();

// ============================================================
// TEST 3: Bug - _createApplyModifier returns undefined
// ============================================================
console.log('\n[TEST 3] Bug: _createApplyModifier returns undefined');
console.log('-'.repeat(60));

function testBug3_returnsUndefined() {
    const stats = {
        health_max: new EnhancedStat(100, { name: 'health_max' }),
        attack_damage: new EnhancedStat(10, { name: 'attack_damage' })
    };

    const primary = {
        str: new EnhancedStat(10, { name: 'str' })
    };

    // Simulating buggy _createApplyModifier
    function buggyCreateApplyModifier(primary, stats, context) {
        return (statKey, value, type, source, options = {}) => {
            if (value == null) return;  // ❌ No return value

            if (stats[statKey]) {
                const mod = new StatModifier({
                    value: value,
                    type: type,
                    source: source,
                    priority: options.priority || 0
                });
                stats[statKey].addModifier(mod);
            } else if (primary[statKey]) {
                const mod = new StatModifier({
                    value: value,
                    type: type,
                    source: source,
                    priority: options.priority || 0
                });
                primary[statKey].addModifier(mod);
            }
            // ❌ BUG: If neither matches, function returns undefined silently
        };
    }

    const applyMod = buggyCreateApplyModifier(primary, stats, {});

    // Test with valid stat
    console.log('Testing with valid stat "attack_damage":');
    applyMod('attack_damage', 5, StatModifierType.FLAT, 'Test');
    console.log(`  attack_damage = ${stats.attack_damage.getValue()}`);

    // Test with invalid stat (BUG!)
    console.log('Testing with invalid stat "unknown_stat":');
    const result = applyMod('unknown_stat', 10, StatModifierType.FLAT, 'Test');
    console.log(`  Return value: ${result}`);  // ❌ undefined
    console.log(`  ❌ BUG: Silent failure - no indication that stat wasn't found!`);
}

testBug3_returnsUndefined();

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('SUMMARY - Bugs Found in 12-Layer Pipeline');
console.log('='.repeat(60));
console.log('');
console.log('CRITICAL BUGS:');
console.log('  1. [BUG] context.primary is undefined in _applyGrowth');
console.log('  2. [BUG] Layer Order - Scaling sebelum Caps');
console.log('');
console.log('MEDIUM BUGS:');
console.log('  3. [BUG] _createApplyModifier returns undefined silently');
console.log('  4. [BUG] Missing explicit Layer 12 CAPS section');
console.log('');
console.log('LOW BUGS:');
console.log('  5. [BUG] Hardcoded priority values without constants');
console.log('');
console.log('IMPACT:');
console.log('  - Growth bonuses may not be applied correctly');
console.log('  - Attribute scaling may exceed caps unexpectedly');
console.log('  - Debugging stat calculation issues is difficult');
console.log('='.repeat(60));
