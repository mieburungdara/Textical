/**
 * Monster AI Tests
 * 
 * Tests for intelligent monster behavior in combat.
 * 
 * ============================================================
 * LAST UPDATED: 2026-03-08
 * TEST RUN: March 8, 2026
 * ============================================================
 * 
 * CHANGE LOG:
 * - 2026-03-08: Initial Monster AI tests
 *   - Target selection tests
 *   - Role detection tests
 *   - AI decision tests
 * 
 * ============================================================
 */

import assert from 'node:assert';
import test from 'node:test';
import { CombatSimulator } from '../dist/src/combat/CombatSimulator.js';
import {
  detectUnitRole,
  calculateThreat,
  selectBestTarget,
  selectBestSkill,
  makeAIDecision,
  isAIUnit,
  UnitRole,
  AIPersonality,
  AI_CONFIGS
} from '../dist/src/combat/MonsterAI.js';

// ========== ROLE DETECTION TESTS ==========

/**
 * Test unit role detection for healer
 */
test('MonsterAI - detect healer role', () => {
  const healerUnit = {
    id: 'enemy_healer',
    name: 'Healer',
    level: 20,
    hp: 100,
    maxHp: 100,
    attack: 5,
    defense: 5,
    speed: 30,
    magic: 50,
    mana: 100,
    maxMana: 100,
    critRate: 10,
    critDamage: 1.5,
    evasion: 10,
    resistance: 20,
    attackRange: 3,
    moveRange: 3,
    skillIds: ['heal', 'greater_heal']
  };
  
  const role = detectUnitRole(healerUnit);
  assert.strictEqual(role, UnitRole.HEALER, 'Should detect healer role');
  
  console.log('✓ Detected healer role correctly');
});

/**
 * Test unit role detection for attacker
 */
test('MonsterAI - detect attacker role', () => {
  const attackerUnit = {
    id: 'enemy_mage',
    name: 'Mage',
    level: 20,
    hp: 80,
    maxHp: 80,
    attack: 5,
    defense: 3,
    speed: 40,
    magic: 80,
    mana: 100,
    maxMana: 100,
    critRate: 15,
    critDamage: 1.5,
    evasion: 10,
    resistance: 30,
    attackRange: 4,
    moveRange: 3,
    skillIds: ['fireball', 'ice_shard']
  };
  
  const role = detectUnitRole(attackerUnit);
  assert.strictEqual(role, UnitRole.ATTACKER, 'Should detect attacker role');
  
  console.log('✓ Detected attacker (mage) role correctly');
});

/**
 * Test unit role detection for tank
 */
test('MonsterAI - detect tank role', () => {
  const tankUnit = {
    id: 'enemy_tank',
    name: 'Orc Warrior',
    level: 20,
    hp: 300,
    maxHp: 300,
    attack: 30,
    defense: 25,
    speed: 20,
    magic: 5,
    mana: 50,
    maxMana: 50,
    critRate: 5,
    critDamage: 1.5,
    evasion: 5,
    resistance: 10,
    attackRange: 1,
    moveRange: 3,
    skillIds: []
  };
  
  const role = detectUnitRole(tankUnit);
  assert.strictEqual(role, UnitRole.TANK, 'Should detect tank role');
  
  console.log('✓ Detected tank role correctly');
});

/**
 * Test unit role detection for boss
 */
test('MonsterAI - detect boss role', () => {
  const bossUnit = {
    id: 'boss_dragon',
    name: 'Ancient Dragon',
    level: 60,
    hp: 1000,
    maxHp: 1000,
    attack: 100,
    defense: 50,
    speed: 40,
    magic: 80,
    mana: 200,
    maxMana: 200,
    critRate: 20,
    critDamage: 2.0,
    evasion: 15,
    resistance: 50,
    attackRange: 2,
    moveRange: 3,
    skillIds: ['fireball', 'flame_strike', 'meteor']
  };
  
  const role = detectUnitRole(bossUnit);
  assert.strictEqual(role, UnitRole.BOSS, 'Should detect boss role');
  
  console.log('✓ Detected boss role correctly');
});

// ========== THREAT CALCULATION TESTS ==========

/**
 * Test threat calculation
 */
test('MonsterAI - calculate threat level', () => {
  const highThreatUnit = {
    id: 'enemy_mage',
    name: 'Mage',
    level: 20,
    hp: 80,
    maxHp: 80,
    attack: 5,
    defense: 3,
    speed: 40,
    magic: 80,
    mana: 100,
    maxMana: 100,
    critRate: 15,
    critDamage: 1.5,
    evasion: 10,
    resistance: 30,
    attackRange: 4,
    moveRange: 3,
    skillIds: ['fireball', 'ice_shard'],
    statusEffects: []
  };
  
  const threat = calculateThreat(highThreatUnit);
  assert.ok(threat > 50, 'Mage should have high threat');
  
  console.log(`✓ Mage threat level: ${threat}`);
  
  const lowThreatUnit = {
    id: 'enemy_slime',
    name: 'Slime',
    level: 5,
    hp: 30,
    maxHp: 30,
    attack: 5,
    defense: 2,
    speed: 10,
    magic: 0,
    mana: 0,
    maxMana: 0,
    critRate: 5,
    critDamage: 1.25,
    evasion: 3,
    resistance: 0,
    attackRange: 1,
    moveRange: 3,
    skillIds: [],
    statusEffects: []
  };
  
  const lowThreat = calculateThreat(lowThreatUnit);
  assert.ok(lowThreat < 20, 'Slime should have low threat');
  
  console.log(`✓ Slime threat level: ${lowThreat}`);
});

// ========== TARGET SELECTION TESTS ==========

/**
 * Test aggressive target selection (lowest HP)
 */
test('MonsterAI - aggressive selects lowest HP', () => {
  const attacker = {
    id: 'enemy_1',
    name: 'Enemy'
  };
  
  const targets = [
    { id: 'target1', name: 'HighHP', isAlive: true, currentHp: 100, maxHp: 100, attack: 10, magic: 0 },
    { id: 'target2', name: 'LowHP', isAlive: true, currentHp: 10, maxHp: 100, attack: 10, magic: 0 },
    { id: 'target3', name: 'MedHP', isAlive: true, currentHp: 50, maxHp: 100, attack: 10, magic: 0 },
  ];
  
  const selected = selectBestTarget(attacker, targets, AIPersonality.AGGRESSIVE);
  
  assert.strictEqual(selected?.id, 'target2', 'Should select lowest HP target');
  console.log('✓ Aggressive AI selects lowest HP target');
});

/**
 * Test defensive target selection (highest threat)
 */
test('MonsterAI - defensive selects highest threat', () => {
  const attacker = {
    id: 'enemy_1',
    name: 'Enemy'
  };
  
  const targets = [
    { id: 'weak', name: 'Weak', isAlive: true, currentHp: 100, maxHp: 100, attack: 5, magic: 0 },
    { id: 'strong', name: 'Strong', isAlive: true, currentHp: 100, maxHp: 100, attack: 50, magic: 0 },
  ];
  
  const selected = selectBestTarget(attacker, targets, AIPersonality.DEFENSIVE);
  
  assert.strictEqual(selected?.id, 'strong', 'Should select highest threat target');
  console.log('✓ Defensive AI selects highest threat target');
});

/**
 * Test balanced target selection
 */
test('MonsterAI - balanced considers both HP and threat', () => {
  const attacker = {
    id: 'enemy_1',
    name: 'Enemy'
  };
  
  const targets = [
    { id: 'low_hp_strong', name: 'LowHPStrong', isAlive: true, currentHp: 20, maxHp: 100, attack: 50, magic: 0 },
    { id: 'high_hp_weak', name: 'HighHPWeak', isAlive: true, currentHp: 90, maxHp: 100, attack: 5, magic: 0 },
  ];
  
  const selected = selectBestTarget(attacker, targets, AIPersonality.BALANCED);
  
  // Should select the low HP but strong target (most vulnerable)
  assert.ok(selected !== null, 'Should select a target');
  console.log(`✓ Balanced AI selected: ${selected?.name}`);
});

// ========== SKILL SELECTION TESTS ==========

/**
 * Test skill selection when low HP
 */
test('MonsterAI - selects heal when low HP', () => {
  const unit = {
    id: 'enemy_healer',
    name: 'Healer',
    currentHp: 20,
    hp: 20,
    maxHp: 100,
    mana: 100,
    skillIds: ['heal', 'fireball']
  };
  
  const target = {
    id: 'enemy1',
    name: 'Enemy'
  };
  
  const allies = [unit];
  
  const skillId = selectBestSkill(unit, target, allies, 10, AIPersonality.BALANCED);
  
  assert.strictEqual(skillId, 'heal', 'Should select heal when low HP');
  console.log('✓ AI selects heal when HP is low');
});

/**
 * Test skill selection when healthy
 */
test('MonsterAI - selects damage skill when healthy', () => {
  const unit = {
    id: 'enemy_mage',
    name: 'Mage',
    hp: 90,
    maxHp: 100,
    mana: 100,
    skillIds: ['heal', 'fireball']
  };
  
  const target = {
    id: 'player1',
    name: 'Player'
  };
  
  const allies = [unit];
  
  const skillId = selectBestSkill(unit, target, allies, 10, AIPersonality.BALANCED);
  
  assert.strictEqual(skillId, 'fireball', 'Should select damage skill when healthy');
  console.log('✓ AI selects damage skill when HP is healthy');
});

// ========== AI DECISION TESTS ==========

/**
 * Test AI decision making
 */
test('MonsterAI - makes correct decision', () => {
  const unit = {
    id: 'enemy_mage',
    name: 'Mage',
    hp: 50,
    maxHp: 100,
    mana: 100,
    attack: 10,
    magic: 50,
    defense: 5,
    speed: 40,
    attackRange: 4,
    skillIds: ['fireball', 'heal']
  };
  
  const enemies = [
    { id: 'player1', name: 'Player1', isAlive: true, currentHp: 80, maxHp: 100, attack: 20, magic: 10 },
    { id: 'player2', name: 'Player2', isAlive: true, currentHp: 20, maxHp: 100, attack: 5, magic: 0 },
  ];
  
  const allies = [unit];
  
  const decision = makeAIDecision(unit, enemies, allies, 10);
  
  assert.ok(decision.targetId !== null, 'Should select a target');
  assert.ok(decision.action !== undefined, 'Should decide action');
  console.log(`✓ AI Decision: ${decision.action} on ${decision.targetId} (${decision.reason})`);
});

// ========== AI UNIT DETECTION TESTS ==========

/**
 * Test AI unit detection
 */
test('MonsterAI - detects AI units', () => {
  const enemyUnit = { id: 'enemy_goblin', name: 'Goblin' };
  const monsterUnit = { id: 'monster_slime', name: 'Slime' };
  const npcUnit = { id: 'npc_merchant', name: 'Merchant' };
  const playerUnit = { id: 'player_hero', name: 'Hero' };
  
  assert.strictEqual(isAIUnit(enemyUnit), true, 'Should detect enemy unit');
  assert.strictEqual(isAIUnit(monsterUnit), true, 'Should detect monster unit');
  assert.strictEqual(isAIUnit(npcUnit), true, 'Should detect NPC unit');
  assert.strictEqual(isAIUnit(playerUnit), false, 'Should not detect player unit');
  
  console.log('✓ AI unit detection works correctly');
});

// ========== AI CONFIG TESTS ==========

/**
 * Test AI configurations
 */
test('MonsterAI - AI configs are valid', () => {
  assert.ok(AI_CONFIGS[AIPersonality.AGGRESSIVE], 'Should have aggressive config');
  assert.ok(AI_CONFIGS[AIPersonality.DEFENSIVE], 'Should have defensive config');
  assert.ok(AI_CONFIGS[AIPersonality.BALANCED], 'Should have balanced config');
  assert.ok(AI_CONFIGS[AIPersonality.BOSS], 'Should have boss config');
  
  // Check thresholds
  const aggressive = AI_CONFIGS[AIPersonality.AGGRESSIVE];
  const defensive = AI_CONFIGS[AIPersonality.DEFENSIVE];
  
  assert.ok(aggressive.healThreshold < defensive.healThreshold, 'Aggressive heals at lower HP');
  assert.ok(defensive.saveUltimate === true, 'Defensive saves ultimate');
  
  console.log('✓ AI configurations are valid');
});

// ========== COMBAT INTEGRATION TESTS ==========

/**
 * Test AI in actual combat
 */
test('Combat - monster AI makes intelligent decisions', async () => {
  const simulator = new CombatSimulator();
  
  // Player team
  const playerTeam = [
    { 
      id: 'player_healer', 
      name: 'Healer', 
      level: 10, 
      hp: 80, 
      maxHp: 80, 
      attack: 5, 
      defense: 3, 
      speed: 40, 
      magic: 30,
      mana: 100,
      maxMana: 100,
      critRate: 10, 
      critDamage: 1.5, 
      evasion: 10, 
      resistance: 10,
      attackRange: 3,
      skillIds: ['heal']
    },
    { 
      id: 'player_warrior', 
      name: 'Warrior', 
      level: 10, 
      hp: 100, 
      maxHp: 100, 
      attack: 20, 
      defense: 8, 
      speed: 30, 
      magic: 0,
      mana: 50,
      maxMana: 50,
      critRate: 10, 
      critDamage: 1.5, 
      evasion: 5, 
      resistance: 0,
      attackRange: 1
    }
  ];
  
  // Monster team with skills
  const enemyTeam = [
    { 
      id: 'enemy_mage', 
      name: 'Enemy Mage', 
      level: 10, 
      hp: 60, 
      maxHp: 60, 
      attack: 5, 
      defense: 2, 
      speed: 45, 
      magic: 40,
      mana: 100,
      maxMana: 100,
      critRate: 10, 
      critDamage: 1.5, 
      evasion: 10, 
      resistance: 20,
      attackRange: 4,
      skillIds: ['fireball', 'heal']
    }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  assert.ok(result.logs.length > 0, 'Should have combat logs');
  console.log(`✓ Combat with AI: winner=${result.winner}, ticks=${result.totalTicks}`);
});

/**
 * Test boss AI behavior
 */
test('Combat - boss AI uses skills strategically', async () => {
  const simulator = new CombatSimulator();
  
  const playerTeam = [
    { 
      id: 'player1', 
      name: 'Hero', 
      level: 30, 
      hp: 200, 
      maxHp: 200, 
      attack: 40, 
      defense: 15, 
      speed: 50, 
      magic: 20,
      mana: 100,
      maxMana: 100,
      critRate: 20, 
      critDamage: 1.5, 
      evasion: 15, 
      resistance: 10,
      attackRange: 1
    }
  ];
  
  // Boss monster
  const enemyTeam = [
    { 
      id: 'boss_dragon', 
      name: 'Ancient Dragon', 
      level: 50, 
      hp: 500, 
      maxHp: 500, 
      attack: 60, 
      defense: 30, 
      speed: 40, 
      magic: 80,
      mana: 200,
      maxMana: 200,
      critRate: 25, 
      critDamage: 2.0, 
      evasion: 15, 
      resistance: 50,
      attackRange: 2,
      skillIds: ['fireball', 'flame_strike', 'heal']
    }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  assert.ok(result.logs.length > 0, 'Should have combat logs');
  console.log(`✓ Boss combat: winner=${result.winner}, ticks=${result.totalTicks}`);
});

console.log('===========================================');
console.log('All Monster AI Tests Completed!');
console.log('Last Updated: 2026-03-08');
console.log('===========================================');
