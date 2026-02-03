#!/usr/bin/env node
/**
 * Stat Elemental Audit Script
 * Verifies elemental modifiers and damage calculations
 * 
 * Usage: node scripts/audit/stat_elemental_audit.js
 */

const ElementalResolver = require('../../src/services/stat/ElementalResolver');

console.log('='.repeat(60));
console.log('STAT ELEMENTAL AUDIT');
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

// Test all elements defined
console.log('\n--- Element Definition Tests ---');

const elements = ['FIRE', 'WATER', 'EARTH', 'WIND', 'LIGHT', 'DARK'];
elements.forEach(element => {
    test(`Element ${element} is defined`,
         ElementalResolver.Element[element] !== undefined,
         'defined',
         ElementalResolver.Element[element]);
});

// Test elemental interactions
console.log('\n--- Elemental Interaction Tests ---');

const interactions = [
    { attacker: 'fire', defender: 'wind', expected: 1.5, description: 'Fire strong against Wind' },
    { attacker: 'fire', defender: 'water', expected: 0.5, description: 'Fire weak against Water' },
    { attacker: 'fire', defender: 'earth', expected: 1.0, description: 'Fire neutral against Earth' },
    { attacker: 'water', defender: 'fire', expected: 1.5, description: 'Water strong against Fire' },
    { attacker: 'water', defender: 'earth', expected: 0.5, description: 'Water weak against Earth' },
    { attacker: 'earth', defender: 'water', expected: 1.5, description: 'Earth strong against Water' },
    { attacker: 'earth', defender: 'wind', expected: 0.5, description: 'Earth weak against Wind' },
    { attacker: 'wind', defender: 'earth', expected: 1.5, description: 'Wind strong against Earth' },
    { attacker: 'wind', defender: 'fire', expected: 0.5, description: 'Wind weak against Fire' },
    { attacker: 'light', defender: 'dark', expected: 1.5, description: 'Light strong against Dark' },
    { attacker: 'dark', defender: 'light', expected: 1.5, description: 'Dark strong against Light' }
];

interactions.forEach(interaction => {
    const multiplier = ElementalResolver.calculateDamageMultiplier(
        interaction.attacker,
        interaction.defender
    );
    test(`${interaction.description}`,
         Math.abs(multiplier - interaction.expected) < 0.01,
         interaction.expected,
         multiplier);
});

// Test resistance application
console.log('\n--- Resistance Application Tests ---');

test('0% resistance: full damage',
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: 0 } }) === 0.5,
     0.5,
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: 0 } }));

test('50% resistance: half damage',
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: 0.5 } }) === 0.25,
     0.25,
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: 0.5 } }));

test('100% resistance: no damage',
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: 1.0 } }) === 0,
     0,
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: 1.0 } }));

test('Negative resistance (weakness): increased damage',
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: -0.5 } }) === 0.75,
     0.75,
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: -0.5 } }));

// Test bonus damage from affinity
console.log('\n--- Bonus Damage Tests ---');

test('Hero fire affinity 20%: 1.2x bonus',
     ElementalResolver.calculateDamageMultiplier('fire', 'earth', { fire: { bonusDamage: 0.2 } }) === 1.2,
     1.2,
     ElementalResolver.calculateDamageMultiplier('fire', 'earth', { fire: { bonusDamage: 0.2 } }));

test('No affinity: 1.0x bonus',
     ElementalResolver.calculateDamageMultiplier('fire', 'earth', {}) === 1.0,
     1.0,
     ElementalResolver.calculateDamageMultiplier('fire', 'earth', {}));

// Test combined factors
console.log('\n--- Combined Factor Tests ---');

const combinedHeroAffinity = { fire: { bonusDamage: 0.3 } };
const combinedTargetAffinity = { water: { resistance: 0.2 } };
const combinedMultiplier = ElementalResolver.calculateDamageMultiplier(
    'fire', 'water', combinedHeroAffinity, combinedTargetAffinity
);
// Strong (1.5) * Hero bonus (1.3) * Target resistance (0.8) = 1.5 * 1.3 * 0.8 = 1.56
test('Combined: Strong + 30% bonus + 20% resistance = 1.56',
     Math.abs(combinedMultiplier - 1.56) < 0.01,
     1.56,
     combinedMultiplier);

// Test get resistances
console.log('\n--- Get Resistances Tests ---');

const heroWithAffinities = {
    elementalAffinities: [
        { elementTypeId: 'fire', resistance: 0.3 },
        { elementTypeId: 'water', resistance: 0.1 }
    ]
};

const resistances = ElementalResolver.getResistances(heroWithAffinities);
test('Fire resistance extracted: 0.3', resistances.fire === 0.3, 0.3, resistances.fire);
test('Water resistance extracted: 0.1', resistances.water === 0.1, 0.1, resistances.water);
test('Earth resistance defaults to 0', resistances.earth === 0, 0, resistances.earth);
test('All 6 elements present', Object.keys(resistances).length === 6, 6, Object.keys(resistances).length);

// Test get bonus damage
console.log('\n--- Get Bonus Damage Tests ---');

const bonusDamage = ElementalResolver.getBonusDamage(heroWithAffinities);
test('Fire bonus damage extracted', bonusDamage.fire === 0.3, 0.3, bonusDamage.fire);
test('Water bonus damage is 0', bonusDamage.water === 0, 0, bonusDamage.water);

// Test has affinity
console.log('\n--- Has Affinity Tests ---');

test('Has fire affinity', ElementalResolver.hasAffinity(heroWithAffinities, 'fire') === true, true, ElementalResolver.hasAffinity(heroWithAffinities, 'fire'));
test('Does not have earth affinity', ElementalResolver.hasAffinity(heroWithAffinities, 'earth') === false, false, ElementalResolver.hasAffinity(heroWithAffinities, 'earth'));
test('No affinities: false', ElementalResolver.hasAffinity({}, 'fire') === false, false, ElementalResolver.hasAffinity({}, 'fire'));

// Test calculate total elemental damage
console.log('\n--- Total Elemental Damage Tests ---');

const stats = { attack_damage: 100 };
const affinities = [
    { elementTypeId: 'fire', bonusDamage: 0.2 },
    { elementTypeId: 'ice', bonusDamage: 0.1 }
];

const totalDamage = ElementalResolver.calculateTotalElementalDamage(stats, affinities);
test('Fire damage: 100 * 1.2 = 120', totalDamage.fire === 120, 120, totalDamage.fire);
test('Ice damage: 100 * 1.1 = 110', totalDamage.ice === 110, 110, totalDamage.ice);
test('Water damage: 100 (no affinity)', totalDamage.water === 100, 100, totalDamage.water);

// Test get interaction description
console.log('\n--- Interaction Description Tests ---');

const strongInteraction = ElementalResolver.getInteraction('fire', 'wind');
test('Strong interaction: multiplier 1.5', strongInteraction.multiplier === 1.5, 1.5, strongInteraction.multiplier);
test('Strong interaction: description contains "Strong"',
     strongInteraction.description.includes('Strong'),
     'contains "Strong"',
     strongInteraction.description);

const weakInteraction = ElementalResolver.getInteraction('fire', 'water');
test('Weak interaction: multiplier 0.5', weakInteraction.multiplier === 0.5, 0.5, weakInteraction.multiplier);
test('Weak interaction: description contains "Weak"',
     weakInteraction.description.includes('Weak'),
     'contains "Weak"',
     weakInteraction.description);

const neutralInteraction = ElementalResolver.getInteraction('fire', 'earth');
test('Neutral interaction: multiplier 1.0', neutralInteraction.multiplier === 1.0, 1.0, neutralInteraction.multiplier);

// Test edge cases
console.log('\n--- Edge Case Tests ---');

test('Extreme resistance (200%): 0 damage',
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: 2.0 } }) === 0,
     0,
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, { water: { resistance: 2.0 } }));

test('Unknown element: neutral',
     ElementalResolver.calculateDamageMultiplier('unknown', 'fire') === 1.0,
     1.0,
     ElementalResolver.calculateDamageMultiplier('unknown', 'fire'));

test('Unknown element interaction: unknown description',
     ElementalResolver.getInteraction('unknown', 'fire').description.includes('Unknown'),
     'contains "Unknown"',
     ElementalResolver.getInteraction('unknown', 'fire').description);

test('Null hero affinity: neutral',
     ElementalResolver.calculateDamageMultiplier('fire', 'water', null, { water: {} }) === 0.5,
     0.5,
     ElementalResolver.calculateDamageMultiplier('fire', 'water', null, { water: {} }));

test('Null target affinity: neutral',
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, null) === 0.5,
     0.5,
     ElementalResolver.calculateDamageMultiplier('fire', 'water', {}, null));

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
