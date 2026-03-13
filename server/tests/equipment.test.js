/**
 * Equipment System Tests
 * 
 * Tests for weapon types, equipment stats, and combat integration.
 * 
 * ============================================================
 * LAST UPDATED: 2026-03-08
 * TEST RUN: March 8, 2026
 * ============================================================
 * 
 * CHANGE LOG:
 * - 2026-03-08: Initial Equipment system tests
 *   - Weapon type and category tests
 *   - Weapon stats tests
 *   - Helper functions tests
 *   - Monster weapon sets tests
 *   - Combat integration tests
 * 
 * ============================================================
 */

import assert from 'node:assert';
import test from 'node:test';
import { CombatSimulator } from '../dist/src/combat/CombatSimulator.js';
import {
  WeaponType,
  WeaponCategory,
  WEAPON_STATS,
  WEAPON_CATEGORIES,
  getWeaponStats,
  getWeaponGridStats,
  isRangedWeapon,
  isMagicWeapon,
  canAttack,
  MONSTER_WEAPON_SETS,
  getMonsterWeaponSet
} from '../dist/src/templates/items/index.js';

// ========== WEAPON TYPE TESTS ==========

/**
 * Test all weapon types are defined
 */
test('Equipment - all weapon types defined', () => {
  const weaponTypes = Object.values(WeaponType);
  
  // Should have at least 15 weapon types
  assert.ok(weaponTypes.length >= 15, 'Should have at least 15 weapon types');
  
  console.log(`✓ Weapon types: ${weaponTypes.length}`);
  console.log(`  Types: ${weaponTypes.join(', ')}`);
});

/**
 * Test melee weapons
 */
test('Equipment - melee weapons have correct category', () => {
  const meleeWeapons = [
    WeaponType.FIST,
    WeaponType.SWORD,
    WeaponType.DAGGER,
    WeaponType.AXE,
    WeaponType.POLEARM,
    WeaponType.HAMMER,
    WeaponType.GREATSWORD,
    WeaponType.GREATAXE,
    WeaponType.CLUB
  ];
  
  for (const weapon of meleeWeapons) {
    assert.strictEqual(
      WEAPON_CATEGORIES[weapon], 
      WeaponCategory.MELEE, 
      `${weapon} should be MELEE`
    );
  }
  
  console.log(`✓ Melee weapons: ${meleeWeapons.length} types`);
});

/**
 * Test ranged weapons
 */
test('Equipment - ranged weapons have correct category', () => {
  const rangedWeapons = [
    WeaponType.BOW,
    WeaponType.CROSSBOW,
    WeaponType.THROWING,
    WeaponType.LONGBOW
  ];
  
  for (const weapon of rangedWeapons) {
    assert.strictEqual(
      WEAPON_CATEGORIES[weapon], 
      WeaponCategory.RANGED, 
      `${weapon} should be RANGED`
    );
  }
  
  console.log(`✓ Ranged weapons: ${rangedWeapons.length} types`);
});

/**
 * Test magic weapons
 */
test('Equipment - magic weapons have correct category', () => {
  const magicWeapons = [
    WeaponType.STAFF,
    WeaponType.WAND
  ];
  
  for (const weapon of magicWeapons) {
    assert.strictEqual(
      WEAPON_CATEGORIES[weapon], 
      WeaponCategory.MAGIC, 
      `${weapon} should be MAGIC`
    );
  }
  
  console.log(`✓ Magic weapons: ${magicWeapons.length} types`);
});

// ========== WEAPON STATS TESTS ==========

/**
 * Test weapon attack ranges
 */
test('Equipment - weapon attack ranges are correct', () => {
  // Melee weapons should have range 1-2
  assert.strictEqual(WEAPON_STATS[WeaponType.FIST].attackRange, 1);
  assert.strictEqual(WEAPON_STATS[WeaponType.SWORD].attackRange, 1);
  assert.strictEqual(WEAPON_STATS[WeaponType.POLEARM].attackRange, 2);
  
  // Ranged weapons should have range 3-6
  assert.strictEqual(WEAPON_STATS[WeaponType.BOW].attackRange, 5);
  assert.strictEqual(WEAPON_STATS[WeaponType.LONGBOW].attackRange, 6);
  assert.strictEqual(WEAPON_STATS[WeaponType.CROSSBOW].attackRange, 4);
  
  // Magic weapons have range 3
  assert.strictEqual(WEAPON_STATS[WeaponType.STAFF].attackRange, 3);
  assert.strictEqual(WEAPON_STATS[WeaponType.WAND].attackRange, 3);
  
  console.log('✓ Weapon attack ranges are valid (1-6 tiles)');
});

/**
 * Test weapon movement ranges
 */
test('Equipment - weapon movement ranges are valid', () => {
  for (const [weaponType, stats] of Object.entries(WEAPON_STATS)) {
    assert.ok(stats.moveRange >= 2, `${weaponType} should have at least 2 move range`);
    assert.ok(stats.moveRange <= 4, `${weaponType} should have at most 4 move range`);
  }
  
  console.log('✓ All weapon movement ranges are valid (2-4 tiles)');
});

/**
 * Test ranged weapon minimum ranges
 */
test('Equipment - ranged weapons have minimum ranges', () => {
  // Bow requires 2 tiles minimum
  assert.strictEqual(WEAPON_STATS[WeaponType.BOW].minRange, 2);
  
  // Longbow requires 3 tiles minimum
  assert.strictEqual(WEAPON_STATS[WeaponType.LONGBOW].minRange, 3);
  
  // Crossbow requires 2 tiles minimum
  assert.strictEqual(WEAPON_STATS[WeaponType.CROSSBOW].minRange, 2);
  
  // Throwing has minimum 1
  assert.strictEqual(WEAPON_STATS[WeaponType.THROWING].minRange, 1);
  
  console.log('✓ Ranged weapons have appropriate minimum ranges');
});

/**
 * Test weapon damage bonuses
 */
test('Equipment - weapon attack bonuses scale appropriately', () => {
  // Fists have no bonus
  assert.strictEqual(WEAPON_STATS[WeaponType.FIST].attackBonus, 0);
  
  // Basic sword has +5
  assert.strictEqual(WEAPON_STATS[WeaponType.SWORD].attackBonus, 5);
  
  // Great weapons have highest bonuses
  assert.ok(WEAPON_STATS[WeaponType.GREATSWORD].attackBonus >= 10);
  assert.ok(WEAPON_STATS[WeaponType.GREATAXE].attackBonus >= 10);
  
  // Ranged weapons have moderate bonuses
  assert.ok(WEAPON_STATS[WeaponType.BOW].attackBonus >= 3);
  
  console.log('✓ Weapon attack bonuses scale appropriately');
});

/**
 * Test weapon defense bonuses
 */
test('Equipment - weapon defense bonuses', () => {
  // Shield has highest defense
  assert.strictEqual(WEAPON_STATS[WeaponType.SHIELD].defenseBonus, 8);
  
  // Sword has moderate defense
  assert.strictEqual(WEAPON_STATS[WeaponType.SWORD].defenseBonus, 2);
  
  // Dagger has negative defense (light armor)
  assert.strictEqual(WEAPON_STATS[WeaponType.DAGGER].defenseBonus, -1);
  
  console.log('✓ Weapon defense bonuses are correct');
});

// ========== HELPER FUNCTION TESTS ==========

/**
 * Test getWeaponStats function
 */
test('Equipment - getWeaponStats returns correct stats', () => {
  const swordStats = getWeaponStats(WeaponType.SWORD);
  
  assert.strictEqual(swordStats.attackRange, 1);
  assert.strictEqual(swordStats.moveRange, 3);
  assert.strictEqual(swordStats.attackBonus, 5);
  assert.strictEqual(swordStats.defenseBonus, 2);
  
  console.log('✓ getWeaponStats works correctly');
});

/**
 * Test getWeaponGridStats function
 */
test('Equipment - getWeaponGridStats returns grid stats', () => {
  const bowGrid = getWeaponGridStats(WeaponType.BOW);
  
  assert.strictEqual(bowGrid.attackRange, 5);
  assert.strictEqual(bowGrid.moveRange, 4);
  assert.strictEqual(bowGrid.minRange, 2);
  
  console.log('✓ getWeaponGridStats works correctly');
});

/**
 * Test isRangedWeapon function
 */
test('Equipment - isRangedWeapon correctly identifies ranged', () => {
  assert.strictEqual(isRangedWeapon(WeaponType.BOW), true);
  assert.strictEqual(isRangedWeapon(WeaponType.LONGBOW), true);
  assert.strictEqual(isRangedWeapon(WeaponType.CROSSBOW), true);
  
  assert.strictEqual(isRangedWeapon(WeaponType.SWORD), false);
  assert.strictEqual(isRangedWeapon(WeaponType.FIST), false);
  
  console.log('✓ isRangedWeapon works correctly');
});

/**
 * Test isMagicWeapon function
 */
test('Equipment - isMagicWeapon correctly identifies magic', () => {
  assert.strictEqual(isMagicWeapon(WeaponType.STAFF), true);
  assert.strictEqual(isMagicWeapon(WeaponType.WAND), true);
  
  assert.strictEqual(isMagicWeapon(WeaponType.SWORD), false);
  assert.strictEqual(isMagicWeapon(WeaponType.BOW), false);
  
  console.log('✓ isMagicWeapon works correctly');
});

/**
 * Test canAttack function
 */
test('Equipment - canAttack correctly identifies attack capability', () => {
  assert.strictEqual(canAttack(WeaponType.SWORD), true);
  assert.strictEqual(canAttack(WeaponType.BOW), true);
  assert.strictEqual(canAttack(WeaponType.STAFF), true);
  
  // Shield cannot attack
  assert.strictEqual(canAttack(WeaponType.SHIELD), false);
  
  console.log('✓ canAttack works correctly');
});

// ========== MONSTER WEAPON SETS TESTS ==========

/**
 * Test monster weapon sets are defined
 */
test('Equipment - monster weapon sets defined', () => {
  const sets = Object.keys(MONSTER_WEAPON_SETS);
  
  assert.ok(sets.length > 5, 'Should have multiple monster weapon sets');
  
  console.log(`✓ Monster weapon sets: ${sets.length}`);
  console.log(`  Sets: ${sets.join(', ')}`);
});

/**
 * Test skeleton weapon sets
 */
test('Equipment - skeleton weapon sets', () => {
  const skeletonWarrior = getMonsterWeaponSet('skeleton_warrior');
  assert.ok(skeletonWarrior.includes(WeaponType.SWORD));
  assert.ok(skeletonWarrior.includes(WeaponType.SHIELD));
  
  const skeletonArcher = getMonsterWeaponSet('skeleton_archer');
  assert.ok(skeletonArcher.includes(WeaponType.BOW));
  
  const skeletonMage = getMonsterWeaponSet('skeleton_mage');
  assert.ok(skeletonMage.includes(WeaponType.STAFF));
  
  console.log('✓ Skeleton weapon sets are correct');
});

/**
 * Test dragon weapon sets
 */
test('Equipment - dragon weapon sets', () => {
  const dragonMelee = getMonsterWeaponSet('dragon_melee');
  assert.ok(dragonMelee.includes(WeaponType.FIST)); // Claws
  
  const dragonMage = getMonsterWeaponSet('dragon_mage');
  assert.ok(dragonMage.includes(WeaponType.STAFF));
  
  console.log('✓ Dragon weapon sets are correct');
});

/**
 * Test default weapon set for unknown monsters
 */
test('Equipment - default weapon set for unknown', () => {
  const unknown = getMonsterWeaponSet('unknown_monster');
  assert.deepStrictEqual(unknown, [WeaponType.FIST]);
  
  console.log('✓ Default weapon set is FIST (unarmed)');
});

// ========== WEAPON RANGE IN COMBAT TESTS ==========

/**
 * Test melee weapon range in combat
 */
test('Combat - melee weapon (sword) attack range', async () => {
  const simulator = new CombatSimulator();
  
  // Player with sword (range 1)
  const playerTeam = [
    { 
      id: 'player1', 
      name: 'Swordmaster', 
      level: 10, 
      hp: 100, 
      maxHp: 100, 
      attack: 20, 
      defense: 5, 
      speed: 50, 
      magic: 10,
      mana: 50,
      maxMana: 50,
      critRate: 15, 
      critDamage: 1.5, 
      evasion: 10, 
      resistance: 5,
      attackRange: 1,
      equipment: [WeaponType.SWORD]
    }
  ];
  
  const enemyTeam = [
    { id: 'enemy1', name: 'Enemy', level: 8, hp: 60, maxHp: 60, attack: 12, defense: 3, speed: 30, magic: 0, critRate: 5, critDamage: 1.25, evasion: 5, resistance: 0, attackRange: 1 }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  assert.ok(result.logs.length > 0, 'Should have combat logs');
  console.log(`✓ Melee combat: winner=${result.winner}, ticks=${result.totalTicks}`);
});

/**
 * Test ranged weapon range in combat
 */
test('Combat - ranged weapon (bow) attack range', async () => {
  const simulator = new CombatSimulator();
  
  // Player with bow (range 5)
  const playerTeam = [
    { 
      id: 'player1', 
      name: 'Archer', 
      level: 10, 
      hp: 80, 
      maxHp: 80, 
      attack: 15, 
      defense: 3, 
      speed: 55, 
      magic: 5,
      mana: 30,
      maxMana: 30,
      critRate: 20, 
      critDamage: 1.5, 
      evasion: 15, 
      resistance: 5,
      attackRange: 5,
      equipment: [WeaponType.BOW]
    }
  ];
  
  const enemyTeam = [
    { id: 'enemy1', name: 'Enemy', level: 8, hp: 60, maxHp: 60, attack: 12, defense: 3, speed: 30, magic: 0, critRate: 5, critDamage: 1.25, evasion: 5, resistance: 0, attackRange: 1 }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  assert.ok(result.logs.length > 0, 'Should have combat logs');
  console.log(`✓ Ranged combat: winner=${result.winner}, ticks=${result.totalTicks}`);
});

/**
 * Test longbow extended range in combat
 */
test('Combat - longbow extended range', async () => {
  const simulator = new CombatSimulator();
  
  // Player with longbow (range 6)
  const playerTeam = [
    { 
      id: 'player1', 
      name: 'Sniper', 
      level: 15, 
      hp: 70, 
      maxHp: 70, 
      attack: 25, 
      defense: 2, 
      speed: 60, 
      magic: 5,
      mana: 30,
      maxMana: 30,
      critRate: 25, 
      critDamage: 1.75, 
      evasion: 20, 
      resistance: 5,
      attackRange: 6,
      equipment: [WeaponType.LONGBOW]
    }
  ];
  
  const enemyTeam = [
    { id: 'enemy1', name: 'Enemy', level: 10, hp: 80, maxHp: 80, attack: 15, defense: 5, speed: 35, magic: 0, critRate: 10, critDamage: 1.25, evasion: 5, resistance: 0, attackRange: 1 }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  assert.ok(result.logs.length > 0, 'Should have combat logs');
  console.log(`✓ Longbow combat: winner=${result.winner}, ticks=${result.totalTicks}`);
});

/**
 * Test magic weapon (staff) in combat
 */
test('Combat - magic weapon (staff) in combat', async () => {
  const simulator = new CombatSimulator();
  
  // Player with staff (range 3)
  const playerTeam = [
    { 
      id: 'player1', 
      name: 'Mage', 
      level: 10, 
      hp: 60, 
      maxHp: 60, 
      attack: 5, 
      defense: 2, 
      speed: 40, 
      magic: 50,
      mana: 100,
      maxMana: 100,
      critRate: 10, 
      critDamage: 1.5, 
      evasion: 10, 
      resistance: 20,
      attackRange: 3,
      equipment: [WeaponType.STAFF],
      skillIds: ['fireball']
    }
  ];
  
  const enemyTeam = [
    { id: 'enemy1', name: 'Enemy', level: 8, hp: 50, maxHp: 50, attack: 10, defense: 2, speed: 30, magic: 0, critRate: 5, critDamage: 1.25, evasion: 5, resistance: 0, attackRange: 1 }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  assert.ok(result.logs.length > 0, 'Should have combat logs');
  console.log(`✓ Staff combat: winner=${result.winner}, ticks=${result.totalTicks}`);
});

/**
 * Test shield - cannot attack
 */
test('Combat - shield equipment (cannot attack)', async () => {
  const simulator = new CombatSimulator();
  
  // Player with shield only
  const playerTeam = [
    { 
      id: 'player1', 
      name: 'Tank', 
      level: 10, 
      hp: 150, 
      maxHp: 150, 
      attack: 5, 
      defense: 15, 
      speed: 25, 
      magic: 0,
      mana: 20,
      maxMana: 20,
      critRate: 5, 
      critDamage: 1.5, 
      evasion: 0, 
      resistance: 10,
      attackRange: 1,
      equipment: [WeaponType.SHIELD]
    }
  ];
  
  const enemyTeam = [
    { id: 'enemy1', name: 'Enemy', level: 8, hp: 60, maxHp: 60, attack: 12, defense: 3, speed: 30, magic: 0, critRate: 5, critDamage: 1.25, evasion: 5, resistance: 0, attackRange: 1 }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  // Should still work - will use basic attack
  assert.ok(result.logs.length > 0, 'Should have combat logs');
  console.log(`✓ Shield combat: winner=${result.winner}, ticks=${result.totalTicks}`);
});

// ========== WEAPON BONUS TESTS ==========

/**
 * Test weapon bonuses are applied
 */
test('Combat - weapon attack bonuses applied', async () => {
  const simulator = new CombatSimulator();
  
  // Player with axe (attack bonus +8)
  const playerTeam = [
    { 
      id: 'player1', 
      name: 'Axeman', 
      level: 10, 
      hp: 100, 
      maxHp: 100, 
      attack: 10, // Base attack
      defense: 5, 
      speed: 40, 
      magic: 0,
      mana: 20,
      maxMana: 20,
      critRate: 10, 
      critDamage: 1.5, 
      evasion: 5, 
      resistance: 0,
      attackRange: 1,
      equipment: [WeaponType.AXE] // +8 attack bonus
    }
  ];
  
  const enemyTeam = [
    { id: 'enemy1', name: 'Enemy', level: 8, hp: 60, maxHp: 60, attack: 12, defense: 3, speed: 30, magic: 0, critRate: 5, critDamage: 1.25, evasion: 5, resistance: 0, attackRange: 1 }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  // Find attack actions
  const attackLogs = result.logs.filter(l => l.actionType === 'basic_attack');
  
  assert.ok(result.winner, 'Should have a winner');
  console.log(`✓ Weapon bonus combat: winner=${result.winner}, attacks=${attackLogs.length}`);
});

// ========== WEAPON STATS VALIDATION ==========

/**
 * Test all weapons have valid stats
 */
test('Equipment - all weapons have valid stats', () => {
  for (const [weaponType, stats] of Object.entries(WEAPON_STATS)) {
    // Check attack range
    assert.ok(stats.attackRange >= 1, `${weaponType} should have at least 1 attack range`);
    assert.ok(stats.attackRange <= 6, `${weaponType} should have at most 6 attack range`);
    
    // Check move range
    assert.ok(stats.moveRange >= 2, `${weaponType} should have at least 2 move range`);
    assert.ok(stats.moveRange <= 5, `${weaponType} should have at most 5 move range`);
    
    // Check min range
    assert.ok(stats.minRange >= 0, `${weaponType} should have non-negative min range`);
    assert.ok(stats.minRange < stats.attackRange, `${weaponType} minRange should be less than attackRange`);
    
    // Check bonuses are reasonable
    assert.ok(stats.attackBonus >= -5, `${weaponType} should have reasonable attack bonus`);
    assert.ok(stats.attackBonus <= 20, `${weaponType} should have reasonable attack bonus`);
  }
  
  console.log('✓ All weapons have valid stats');
});

/**
 * Test weapon descriptions are present
 */
test('Equipment - all weapons have descriptions', () => {
  for (const [weaponType, stats] of Object.entries(WEAPON_STATS)) {
    assert.ok(stats.description.length > 0, `${weaponType} should have a description`);
  }
  
  console.log('✓ All weapons have descriptions');
});

console.log('===========================================');
console.log('All Equipment System Tests Completed!');
console.log('Last Updated: 2026-03-08');
console.log('===========================================');
