#!/usr/bin/env node
/**
 * Stat Durability Integrity Audit Script
 * Verifies durability impact on stats and linear degradation
 * 
 * Usage: node scripts/audit/stat_durability_integrity_audit.js
 */

const {
    EnhancedStat,
    StatModifier,
    StatModifierType
} = require('../../src/logic/statSystem');

console.log('='.repeat(60));
console.log('STAT DURABILITY INTEGRITY AUDIT');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;
const results = [];

function test(description, condition, expected, actual) {
    if (condition) {
        passed++;
        results.push({ status: 'PASS', description, expected, actual });
        console.log(`✓ ${description}`);
    } else {
        failed++;
        results.push({ status: 'FAIL', description, expected, actual });
        console.log(`✗ ${description}`);
        console.log(`  Expected: ${expected}`);
        console.log(`  Actual: ${actual}`);
    }
}

// Test linear degradation formula
console.log('\n--- Linear Degradation Tests ---');

function calculateLinearDegradation(baseStat, durabilityPercent) {
    // Linear degradation formula
    const degradationFactor = durabilityPercent / 100;
    return baseStat * degradationFactor;
}

test('100% durability gives full stat', calculateLinearDegradation(100, 100) === 100, 100, calculateLinearDegradation(100, 100));
test('50% durability gives half stat', calculateLinearDegradation(100, 50) === 50, 50, calculateLinearDegradation(100, 50));
test('0% durability gives zero stat', calculateLinearDegradation(100, 0) === 0, 0, calculateLinearDegradation(100, 0));
test('25% durability gives quarter stat', calculateLinearDegradation(100, 25) === 25, 25, calculateLinearDegradation(100, 25));

// Test stat with durability modifier
console.log('\n--- Durability Modifier Tests ---');

function createDurabilityStat(baseValue, durabilityPercent, statName = 'attack') {
    const stat = new EnhancedStat(baseValue, { name: statName, minValue: 0 });
    const degradation = 1 - (durabilityPercent / 100);
    stat.addModifier(new StatModifier({
        value: -baseValue * degradation,
        type: StatModifierType.FLAT,
        source: 'durability_penalty'
    }));
    return stat;
}

const fullDurabilityStat = createDurabilityStat(100, 100);
test('Full durability stat has full value', fullDurabilityStat.getValue() === 100, 100, fullDurabilityStat.getValue());

const halfDurabilityStat = createDurabilityStat(100, 50);
test('Half durability stat has half value', halfDurabilityStat.getValue() === 50, 50, halfDurabilityStat.getValue());

// Test minimum durability threshold
console.log('\n--- Minimum Durability Threshold Tests ---');

const MIN_DURABILITY_THRESHOLD = 10; // 10% minimum before stat penalty

function applyDurabilityWithThreshold(baseStat, durabilityPercent, threshold = MIN_DURABILITY_THRESHOLD) {
    if (durabilityPercent >= threshold) {
        return baseStat * (durabilityPercent / 100);
    }
    // Below threshold, stat is severely penalized
    return baseStat * (threshold / 100) * 0.5;
}

test('Above threshold: 100% durability', applyDurabilityWithThreshold(100, 100) === 100, 100, applyDurabilityWithThreshold(100, 100));
test('At threshold: 10% durability', applyDurabilityWithThreshold(100, 10) === 10, 10, applyDurabilityWithThreshold(100, 10));
test('Below threshold: 5% durability (penalized)', applyDurabilityWithThreshold(100, 5) === 5, 5, applyDurabilityWithThreshold(100, 5));

// Test stat cap with durability
console.log('\n--- Durability with Cap Tests ---');

function calculateCappedDurabilityStat(baseValue, durabilityPercent, maxValue) {
    const effectiveValue = baseValue * (durabilityPercent / 100);
    return Math.min(effectiveValue, maxValue);
}

test('Stat capped at max value', calculateCappedDurabilityStat(200, 100, 150) === 150, 150, calculateCappedDurabilityStat(200, 100, 150));
test('Stat below cap with durability', calculateCappedDurabilityStat(100, 50, 150) === 50, 50, calculateCappedDurabilityStat(100, 50, 150));

// Test multiple stats degradation
console.log('\n--- Multiple Stats Degradation Tests ---');

const equipmentStats = {
    attack: 150,
    defense: 100,
    speed: 80
};

function degradeAllStats(stats, durabilityPercent) {
    const degraded = {};
    Object.entries(stats).forEach(([stat, value]) => {
        degraded[stat] = value * (durabilityPercent / 100);
    });
    return degraded;
}

const degradedAt50 = degradeAllStats(equipmentStats, 50);
test('Attack degraded to 75', degradedAt50.attack === 75, 75, degradedAt50.attack);
test('Defense degraded to 50', degradedAt50.defense === 50, 50, degradedAt50.defense);
test('Speed degraded to 40', degradedAt50.speed === 40, 40, degradedAt50.speed);

// Test degradation over time (simulated usage)
console.log('\n--- Degradation Over Time Tests ---');

function simulateDegradationOverTime(baseStat, durabilityLossPerUse, uses, maxUses = 100) {
    let currentDurability = 100;
    const values = [];
    
    for (let i = 0; i <= uses; i++) {
        const currentValue = baseStat * (currentDurability / 100);
        values.push(currentValue);
        currentDurability = Math.max(0, currentDurability - durabilityLossPerUse);
    }
    
    return values;
}

const degradationCurve = simulateDegradationOverTime(100, 10, 9);
test('First use: 100% value', degradationCurve[0] === 100, 100, degradationCurve[0]);
test('After 5 uses: 50% value', degradationCurve[5] === 50, 50, degradationCurve[5]);
test('After 10 uses: 0% value', degradationCurve[10] === 0, 0, degradationCurve[10]);

// Test partial degradation with modifiers
console.log('\n--- Partial Degradation with Modifiers Tests ---');

function createStatWithModifiersAndDurability(baseValue, modifiers, durabilityPercent) {
    const stat = new EnhancedStat(baseValue, { minValue: 0 });
    
    // Apply base durability penalty
    const durabilityPenalty = baseValue * (1 - durabilityPercent / 100);
    stat.addModifier(new StatModifier({
        value: -durabilityPenalty,
        type: StatModifierType.FLAT,
        source: 'durability'
    }));
    
    // Apply other modifiers
    modifiers.forEach(mod => {
        stat.addModifier(new StatModifier(mod));
    });
    
    return stat;
}

const statWithBonusAndDurability = createStatWithModifiersAndDurability(
    100,
    [{ value: 20, type: StatModifierType.FLAT, source: 'enchant' }],
    80
);
test('Base 100 + enchant 20 - 20% durability = 116', statWithBonusAndDurability.getValue() === 116, 116, statWithBonusAndDurability.getValue());

// Test equipment piece degradation
console.log('\n--- Equipment Piece Degradation Tests ---');

const equipmentPieces = [
    { name: 'Weapon', baseAttack: 50, durability: 100 },
    { name: 'Armor', baseDefense: 80, durability: 75 },
    { name: 'Helmet', baseDefense: 30, durability: 50 },
    { name: 'Boots', baseSpeed: 20, durability: 25 }
];

function calculateTotalEquipmentStats(pieces) {
    const totals = { attack: 0, defense: 0, speed: 0 };
    
    pieces.forEach(piece => {
        const effectiveStat = piece.baseAttack || piece.baseDefense || piece.baseSpeed || 0;
        const degradedValue = effectiveStat * (piece.durability / 100);
        
        if (piece.baseAttack) totals.attack += degradedValue;
        if (piece.baseDefense) totals.defense += degradedValue;
        if (piece.baseSpeed) totals.speed += degradedValue;
    });
    
    return totals;
}

const totalStats = calculateTotalEquipmentStats(equipmentPieces);
test('Total attack: 50 (100% durability)', totalStats.attack === 50, 50, totalStats.attack);
test('Total defense: 80*0.75 + 30*0.5 = 60 + 15 = 75', totalStats.defense === 75, 75, totalStats.defense);
test('Total speed: 20*0.25 = 5', totalStats.speed === 5, 5, totalStats.speed);

// Summary
console.log('\n' + '='.repeat(60));
console.log('AUDIT SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.description}`);
    });
}

console.log('\n' + '='.repeat(60));

module.exports = {
    passed,
    failed,
    results,
    success: failed === 0
};
