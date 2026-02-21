/**
 * Test script for Fixed Growth System
 * Verifies that the fixed growth calculations work correctly
 */

require('dotenv').config();
const fixedGrowthSystem = require('./src/services/stat/FixedGrowthSystem');

console.log('=== Testing Fixed Growth System ===\n');

// Test 1: Warrior stats at various levels
console.log('--- Test 1: Warrior Growth at Level 1 ---');
const warrior1 = fixedGrowthSystem.calculateAllFixedStats('warrior', 1);
console.log('Warrior Lv.1:', JSON.stringify(warrior1, null, 2));

console.log('\n--- Test 2: Warrior Growth at Level 50 ---');
const warrior50 = fixedGrowthSystem.calculateAllFixedStats('warrior', 50);
console.log('Warrior Lv.50:', JSON.stringify(warrior50, null, 2));

console.log('\n--- Test 3: Warrior Growth at Level 100 ---');
const warrior100 = fixedGrowthSystem.calculateAllFixedStats('warrior', 100);
console.log('Warrior Lv.100:', JSON.stringify(warrior100, null, 2));

// Test 2: Mage stats
console.log('\n--- Test 4: Mage Growth at Level 50 ---');
const mage50 = fixedGrowthSystem.calculateAllFixedStats('mage', 50);
console.log('Mage Lv.50:', JSON.stringify(mage50, null, 2));

// Test 3: Archer stats
console.log('\n--- Test 5: Archer Growth at Level 50 ---');
const archer50 = fixedGrowthSystem.calculateAllFixedStats('archer', 50);
console.log('Archer Lv.50:', JSON.stringify(archer50, null, 2));

// Test 4: Growth info
console.log('\n--- Test 6: Growth Info for Warrior ---');
const warriorInfo = fixedGrowthSystem.getGrowthInfo('warrior');
console.log('Warrior Growth Info:', JSON.stringify(warriorInfo, null, 2));

// Test 5: Formula explanation
console.log('\n--- Test 7: Formula for Warrior HP ---');
const hpFormula = fixedGrowthSystem.explainFormula('warrior', 'hp');
console.log('Warrior HP Formula:', hpFormula);

console.log('\n--- Test 8: Formula for Mage Mana ---');
const manaFormula = fixedGrowthSystem.explainFormula('mage', 'mana');
console.log('Mage Mana Formula:', manaFormula);

console.log('\n--- Test 9: Formula for Archer Speed ---');
const speedFormula = fixedGrowthSystem.explainFormula('archer', 'speed');
console.log('Archer Speed Formula:', speedFormula);

// Test 6: Verify deterministic growth
console.log('\n--- Test 10: Verify Deterministic Growth ---');
const warrior50a = fixedGrowthSystem.calculateAllFixedStats('warrior', 50);
const warrior50b = fixedGrowthSystem.calculateAllFixedStats('warrior', 50);
const isDeterministic = JSON.stringify(warrior50a) === JSON.stringify(warrior50b);
console.log('Deterministic (same class/level = same stats):', isDeterministic);

// Test 7: Different classes should have different stats at same level
console.log('\n--- Test 11: Class Differentiation ---');
const w50 = fixedGrowthSystem.calculateAllFixedStats('warrior', 50);
const m50 = fixedGrowthSystem.calculateAllFixedStats('mage', 50);
const a50 = fixedGrowthSystem.calculateAllFixedStats('archer', 50);

console.log('Warrior HP:', w50.hp, '| Mage HP:', m50.hp, '| Archer HP:', a50.hp);
console.log('Warrior Mana:', w50.mana, '| Mage Mana:', m50.mana, '| Archer Mana:', a50.mana);
console.log('Warrior Speed:', w50.speed, '| Mage Speed:', m50.speed, '| Archer Speed:', a50.speed);
console.log('Warrior Crit:', w50.critChance, '| Mage Crit:', m50.critChance, '| Archer Crit:', a50.critChance);

console.log('\n=== All Tests Completed ===');
